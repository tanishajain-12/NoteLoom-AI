const mongoose = require('mongoose')

/**
 * Note / Summary document
 *
 * Stores everything produced by one summarisation job.
 * Every note is now scoped to the user who created it via the `user` field.
 * Existing notes without a user field will still work but won't be returned
 * by authenticated queries (they're orphaned and can be cleaned up manually).
 */
// Quiz result — stores the outcome of the user's most recent quiz attempt.
// Only one result per note (last attempt wins — no history of attempts).
// null by default so notes without an attempt are easily distinguishable.
const quizResultSchema = new mongoose.Schema(
  {
    score:           { type: Number, required: true },
    totalQuestions:  { type: Number, required: true },
    percentage:      { type: Number, required: true },
    correctAnswers:  { type: Number, required: true },
    incorrectAnswers:{ type: Number, required: true },
    completedAt:     { type: Date,   required: true, default: Date.now },
  },
  { _id: false }
)

// Multiple-choice quiz question sub-document.
// Shape: { question, options: [4 strings], correctAnswer: one of the options }
// _id: false — these are embedded value objects, not independently identifiable.
const quizQuestionSchema = new mongoose.Schema(
  {
    question:      { type: String,   required: true, trim: true },
    options:       { type: [String], required: true },   // always exactly 4 items
    correctAnswer: { type: String,   required: true, trim: true },
  },
  { _id: false }
)

// Flashcard sub-document — same shape as a quiz question but semantically
// distinct: short, focused prompt + concise answer for spaced-repetition study.
// Kept as a separate schema so the two can diverge independently in the future.
const flashcardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer:   { type: String, required: true, trim: true },
  },
  { _id: false }
)

const noteSchema = new mongoose.Schema(
  {
    // -----------------------------------------------------------------
    // Owner — every note belongs to exactly one registered user.
    // ref: 'User' enables .populate() if needed in the future.
    // -----------------------------------------------------------------
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must belong to a user'],
    },

    transcript: {
      type: String,
      required: [true, 'Transcript is required'],
      trim: true,
      minlength: [10,    'Transcript must be at least 10 characters'],
      maxlength: [50000, 'Transcript must be at most 50 000 characters'],
    },

    summary: {
      type: String,
      default: '',
      trim: true,
    },

    keyPoints:     { type: [String],               default: [] },
    actionItems:   { type: [String],               default: [] },
    quizQuestions: { type: [quizQuestionSchema],   default: [] },

    // AI-generated flashcards for spaced-repetition study.
    // default:[] ensures existing notes without this field deserialise cleanly.
    flashcards:    { type: [flashcardSchema],      default: [] },

    // Persisted result of the user's most recent quiz attempt.
    // null = no attempt yet; populated/overwritten by PATCH /api/history/:id/quiz-result
    quizResult:    { type: quizResultSchema,       default: null },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
)

// Compound index: fast newest-first queries scoped to one user
noteSchema.index({ user: 1, createdAt: -1 })

const Note = mongoose.model('Note', noteSchema)

module.exports = Note
