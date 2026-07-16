const mongoose = require('mongoose')

/**
 * Note / Summary document
 *
 * Stores everything produced by one summarisation job.
 * Every note is now scoped to the user who created it via the `user` field.
 * Existing notes without a user field will still work but won't be returned
 * by authenticated queries (they're orphaned and can be cleaned up manually).
 */
const quizQuestionSchema = new mongoose.Schema(
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

    keyPoints:  { type: [String],           default: [] },
    actionItems:{ type: [String],           default: [] },
    quizQuestions: { type: [quizQuestionSchema], default: [] },
  },
  {
    timestamps: true, // createdAt + updatedAt
  }
)

// Compound index: fast newest-first queries scoped to one user
noteSchema.index({ user: 1, createdAt: -1 })

const Note = mongoose.model('Note', noteSchema)

module.exports = Note
