import { useState } from 'react'

// ---------------------------------------------------------------------------
// Performance message based on percentage score
// ---------------------------------------------------------------------------
function perfMessage(pct) {
  if (pct >= 90) return { text: 'Excellent! 🎉',                      color: 'text-[#1e6b35]' }
  if (pct >= 70) return { text: 'Great Job! 👏',                      color: 'text-[#2d6a8a]' }
  if (pct >= 50) return { text: 'Good effort! Keep practicing.',       color: 'text-[#7a5c00]' }
  return           { text: 'Review the flashcards and try again.',     color: 'text-[#93000a]' }
}

// ---------------------------------------------------------------------------
// MultipleChoiceQuiz
//
// Props:
//   questions — Array<{ question, options: string[4], correctAnswer }>
//
// Returns null when the array is empty so the caller can hide the section.
// All state lives here — no Redux or context required.
// ---------------------------------------------------------------------------
function MultipleChoiceQuiz({ questions }) {
  // ── state ────────────────────────────────────────────────────────────────
  const [qIndex,    setQIndex]    = useState(0)        // current question index
  const [selected,  setSelected]  = useState(null)     // chosen option string
  const [submitted, setSubmitted] = useState(false)    // has this Q been submitted?
  const [scores,    setScores]    = useState([])       // array of booleans per question
  const [done,      setDone]      = useState(false)    // finished all questions?

  if (!Array.isArray(questions) || questions.length === 0) return null

  const total   = questions.length
  const current = questions[qIndex]

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleSelect = (opt) => {
    if (submitted) return   // lock after submission
    setSelected(opt)
  }

  const handleSubmit = () => {
    if (!selected) return
    const correct = selected === current.correctAnswer
    setScores((prev) => [...prev, correct])
    setSubmitted(true)
  }

  const handleNext = () => {
    if (qIndex < total - 1) {
      setQIndex((i) => i + 1)
      setSelected(null)
      setSubmitted(false)
    } else {
      setDone(true)
    }
  }

  const handleRetake = () => {
    setQIndex(0)
    setSelected(null)
    setSubmitted(false)
    setScores([])
    setDone(false)
  }

  // ── results screen ───────────────────────────────────────────────────────
  if (done) {
    const correct   = scores.filter(Boolean).length
    const incorrect = total - correct
    const pct       = Math.round((correct / total) * 100)
    const { text: perfText, color: perfColor } = perfMessage(pct)

    return (
      <div className="space-y-6">
        {/* Score card */}
        <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-6 text-center">
          {/* Big score */}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#ffdad9] mb-4">
            <span className="font-display text-2xl font-extrabold text-[#8a4d4e]">{pct}%</span>
          </div>

          <h4 className="font-display text-xl font-bold text-[#1b1c1c]">Quiz Complete!</h4>
          <p className={`mt-1 text-sm font-semibold ${perfColor}`}>{perfText}</p>

          {/* Stats row */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-w-xs mx-auto">
            <div className="rounded-xl bg-[#f6f3f2] p-3">
              <p className="font-display text-xl font-extrabold text-[#1b1c1c]">{correct}/{total}</p>
              <p className="text-xs text-[#857372] mt-0.5">Score</p>
            </div>
            <div className="rounded-xl bg-[#e6f4ea] p-3">
              <p className="font-display text-xl font-extrabold text-[#1e6b35]">{correct}</p>
              <p className="text-xs text-[#524343] mt-0.5">Correct</p>
            </div>
            <div className="rounded-xl bg-[#fff5f5] p-3">
              <p className="font-display text-xl font-extrabold text-[#93000a]">{incorrect}</p>
              <p className="text-xs text-[#524343] mt-0.5">Incorrect</p>
            </div>
          </div>
        </div>

        {/* Retake */}
        <div className="flex justify-center">
          <button
            onClick={handleRetake}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8a4d4e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#6e3637] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Retake Quiz
          </button>
        </div>
      </div>
    )
  }

  // ── question screen ───────────────────────────────────────────────────────

  const isCorrect = submitted && selected === current.correctAnswer

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-[#857372]">
            Question {qIndex + 1} of {total}
          </span>
          <span className="text-xs font-medium text-[#857372]">
            {Math.round(((qIndex) / total) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#e4e2e1] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#8a4d4e] transition-all duration-300"
            style={{ width: `${((qIndex) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5">
        <p className="font-display text-base font-semibold text-[#1b1c1c] leading-snug">
          {current.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {current.options.map((opt) => {
          // Determine visual state of each option after submission
          let optClass = 'border-[#d7c2c1] bg-white hover:border-[#8a4d4e] hover:bg-[#ffdad9]/20'
          let labelClass = 'text-[#524343]'
          let radioClass = 'border-[#d7c2c1]'

          if (!submitted && selected === opt) {
            optClass   = 'border-[#8a4d4e] bg-[#ffdad9]/30'
            radioClass = 'border-[#8a4d4e] bg-[#8a4d4e]'
          }

          if (submitted) {
            if (opt === current.correctAnswer) {
              optClass   = 'border-[#4caf50] bg-[#e6f4ea]'
              labelClass = 'text-[#1e6b35] font-medium'
              radioClass = 'border-[#4caf50] bg-[#4caf50]'
            } else if (opt === selected) {
              // User's wrong choice
              optClass   = 'border-[#e53935] bg-[#fff5f5]'
              labelClass = 'text-[#93000a] font-medium'
              radioClass = 'border-[#e53935] bg-[#e53935]'
            } else {
              optClass   = 'border-[#e4e2e1] bg-[#f6f3f2] opacity-60'
            }
          }

          return (
            <button
              key={opt}
              onClick={() => handleSelect(opt)}
              disabled={submitted}
              className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${optClass} disabled:cursor-default`}
            >
              {/* Radio circle */}
              <span
                className={`shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${radioClass}`}
              >
                {(selected === opt || (submitted && opt === current.correctAnswer)) && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </span>
              <span className={`text-sm ${labelClass}`}>{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback message */}
      {submitted && (
        <p className={`text-sm font-semibold ${isCorrect ? 'text-[#1e6b35]' : 'text-[#93000a]'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Incorrect!'}
        </p>
      )}

      {/* Action button */}
      <div className="flex justify-end">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8a4d4e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6e3637] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Submit Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-[#8a4d4e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#6e3637] transition-colors"
          >
            {qIndex < total - 1 ? 'Next Question' : 'See Results'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default MultipleChoiceQuiz
