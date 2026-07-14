const mongoose = require('mongoose')

/**
 * Note / Summary document
 *
 * Stores everything produced by one summarisation job:
 *   transcript    — the raw text sent to Gemini (kept for re-processing)
 *   summary       — paragraph summary returned by Gemini
 *   keyPoints     — bullet-point highlights
 *   actionItems   — tasks / follow-ups extracted from the transcript
 *   quizQuestions — Q&A pairs for self-testing
 *   createdAt     — set automatically by { timestamps: true }
 */
const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
  },
  { _id: false } // sub-documents don't need their own _id
)

const noteSchema = new mongoose.Schema(
  {
    transcript: {
      type: String,
      required: [true, 'Transcript is required'],
      trim: true,
      minlength: [10, 'Transcript must be at least 10 characters'],
      maxlength: [50000, 'Transcript must be at most 50 000 characters'],
    },

    summary: {
      type: String,
      default: '',
      trim: true,
    },

    keyPoints: {
      type: [String],
      default: [],
    },

    actionItems: {
      type: [String],
      default: [],
    },

    quizQuestions: {
      type: [quizQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
)

// Index newest-first so GET /api/history is always fast
noteSchema.index({ createdAt: -1 })

const Note = mongoose.model('Note', noteSchema)

module.exports = Note
