const Note = require('../models/Note')
const asyncHandler = require('../utils/asyncHandler')
const { summariseTranscript } = require('../services/geminiService')

// ---------------------------------------------------------------------------
// @desc    Summarise a transcript with Gemini and persist the result
// @route   POST /api/summarize
// @access  Private (requires valid JWT — protect middleware applied in router)
// ---------------------------------------------------------------------------
const summarize = asyncHandler(async (req, res) => {
  const { transcript } = req.body

  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    res.status(422)
    throw new Error('transcript is required and must be a non-empty string')
  }
  if (transcript.trim().length < 10) {
    res.status(422)
    throw new Error('transcript must be at least 10 characters')
  }
  if (transcript.trim().length > 50000) {
    res.status(422)
    throw new Error('transcript must be at most 50 000 characters')
  }

let aiResult

try {
  aiResult = await summariseTranscript(transcript.trim())
} catch (error) {
  console.error('Gemini Error:', error.message)

  const message = error.message || ''

  // Friendly message for quota exceeded
  if (
    message.includes('429') ||
    message.toLowerCase().includes('quota exceeded')
  ) {
    res.status(429)
    throw new Error(
      'The AI service has reached its daily request limit. Please try again later.'
    )
  }

  // Friendly message for temporary overload
  if (message.includes('503')) {
    res.status(503)
    throw new Error(
      'The AI service is currently busy. Please try again in a few moments.'
    )
  }

  // Generic fallback
  res.status(500)
  throw new Error(
    'Unable to generate the summary right now. Please try again later.'
  )
}



  // Associate the note with the authenticated user
  const note = await Note.create({
    user:          req.user._id,          // <-- scoped to this user
    transcript:    transcript.trim(),
    summary:       aiResult.summary,
    keyPoints:     aiResult.keyPoints,
    actionItems:   aiResult.actionItems,
    quizQuestions: aiResult.quizQuestions,
  })

  res.status(201).json(note)
})

// ---------------------------------------------------------------------------
// @desc    Return all summaries for the authenticated user, newest first
// @route   GET /api/history
// @access  Private
// ---------------------------------------------------------------------------
const getHistory = asyncHandler(async (req, res) => {
  const notes = await Note.find({ user: req.user._id }) // only this user's notes
    .select('-transcript')
    .sort({ createdAt: -1 })

  res.status(200).json(notes)
})

// ---------------------------------------------------------------------------
// @desc    Return a single summary by id (must belong to the authenticated user)
// @route   GET /api/history/:id
// @access  Private
// ---------------------------------------------------------------------------
const getHistoryById = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id })

  if (!note) {
    res.status(404)
    throw new Error('Summary not found')
  }

  res.status(200).json(note)
})

// ---------------------------------------------------------------------------
// @desc    Return dashboard statistics for the authenticated user
// @route   GET /api/notes/stats
// @access  Private
//
// Calculated values:
//   totalNotes   — count of all notes owned by this user
//   hoursSaved   — totalNotes × 0.5  (assumption: each summary saves ~30 min)
//   quizzesTaken — total quiz questions across all notes
//                  (proxy: no per-question answer tracking exists yet)
//   avgAccuracy  — estimated at 85% when quizzesTaken > 0, else 0
//                  (documented estimate — no answer-tracking in the schema)
// ---------------------------------------------------------------------------
const getStats = asyncHandler(async (req, res) => {
  // Single aggregation pipeline — one round-trip to MongoDB
  const [agg] = await Note.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: null,
        totalNotes:    { $sum: 1 },
        quizzesTaken:  { $sum: { $size: '$quizQuestions' } },
      },
    },
  ])

  const totalNotes   = agg?.totalNotes   ?? 0
  const quizzesTaken = agg?.quizzesTaken ?? 0

  // Hours saved: every note roughly replaces 30 minutes of manual note-taking
  const hoursSaved = (totalNotes * 0.5).toFixed(1)

  // Average accuracy: estimated fixed value when the user has done quizzes.
  // Documented as an estimate — real tracking requires a separate UserAnswer
  // collection (future Phase 4+).
  const avgAccuracy = quizzesTaken > 0 ? '85%' : '—'

  res.status(200).json({
    totalNotes,
    hoursSaved:   `${hoursSaved}h`,
    quizzesTaken,
    avgAccuracy,
  })
})

module.exports = { summarize, getHistory, getHistoryById, getStats }
