const Note = require('../models/Note')
const asyncHandler = require('../utils/asyncHandler')
const { summariseTranscript } = require('../services/geminiService')

// ---------------------------------------------------------------------------
// @desc    Summarise a transcript with Gemini and persist the result
// @route   POST /api/summarize
// @access  Public
//
// Request body:
//   { "transcript": "<raw lecture or meeting text>" }
//
// Flow:
//   1. Validate the transcript field
//   2. Call Gemini — returns { summary, keyPoints, actionItems, quizQuestions }
//   3. Save the full document to MongoDB
//   4. Return the saved document (201)
// ---------------------------------------------------------------------------
const summarize = asyncHandler(async (req, res) => {
  const { transcript } = req.body

  // Input validation
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

  // Call Gemini — may throw if the API key is missing or the API is down
  const aiResult = await summariseTranscript(transcript.trim())

  // Persist everything in one document
  const note = await Note.create({
    transcript: transcript.trim(),
    summary:       aiResult.summary,
    keyPoints:     aiResult.keyPoints,
    actionItems:   aiResult.actionItems,
    quizQuestions: aiResult.quizQuestions,
  })

  res.status(201).json(note)
})

// ---------------------------------------------------------------------------
// @desc    Return all summaries, newest first
// @route   GET /api/history
// @access  Public
//
// The list omits the full transcript to keep responses light.
// Each item still contains summary, keyPoints, actionItems, quizQuestions.
// ---------------------------------------------------------------------------
const getHistory = asyncHandler(async (req, res) => {
  const notes = await Note.find()
    .select('-transcript')   // transcript can be large — omit from list view
    .sort({ createdAt: -1 }) // newest first

  res.status(200).json(notes)
})

// ---------------------------------------------------------------------------
// @desc    Return a single summary by id (includes the original transcript)
// @route   GET /api/history/:id
// @access  Public
// ---------------------------------------------------------------------------
const getHistoryById = asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id)

  if (!note) {
    res.status(404)
    throw new Error('Summary not found')
  }

  res.status(200).json(note)
})

module.exports = { summarize, getHistory, getHistoryById }
