import { useState } from 'react'

// ---------------------------------------------------------------------------
// FlashcardDeck
//
// Props:
//   cards — Array<{ question: string, answer: string }>
//
// Behaviour:
//   • Shows one card at a time with a CSS 3-D flip on click
//   • Previous / Next buttons navigate the deck
//   • Changing cards always resets to the question (front) side
//   • Returns null when the cards array is empty so the caller can
//     conditionally render the whole section
// ---------------------------------------------------------------------------
function FlashcardDeck({ cards }) {
  const [index,  setIndex]  = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!Array.isArray(cards) || cards.length === 0) return null

  const card  = cards[index]
  const total = cards.length

  // Flip the current card face over
  const handleFlip = () => setFlipped((f) => !f)

  // Move to the previous card — always unflip first
  const handlePrev = () => {
    if (index === 0) return
    setFlipped(false)
    // Use a tiny timeout so the reset renders before the card changes,
    // preventing a flash of the answer side during the slide.
    setTimeout(() => setIndex((i) => i - 1), 0)
  }

  // Move to the next card — always unflip first
  const handleNext = () => {
    if (index === total - 1) return
    setFlipped(false)
    setTimeout(() => setIndex((i) => i + 1), 0)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* ---------------------------------------------------------------- */}
      {/* Flip card                                                         */}
      {/* ---------------------------------------------------------------- */}
      {/*
        The outer div establishes the 3-D perspective.
        The inner div rotates 180° on the Y-axis when `flipped` is true.
        Front and back are absolutely stacked; back is pre-rotated -180° so
        it appears right-side-up when the container is flipped.
        backface-visibility:hidden keeps the hidden face invisible.
      */}
      <div
        className="w-full cursor-pointer group"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
        role="button"
        aria-label={flipped ? 'Show question' : 'Reveal answer'}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleFlip() }}
      >
        <div
          className="relative w-full group-hover:scale-[1.012] group-hover:shadow-md transition-shadow duration-200"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 400ms ease-in-out',
            minHeight: '200px',
          }}
        >
          {/* Front — Question */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#fff5f3] border border-[#e8cdc9] shadow-sm p-7 flex flex-col items-center justify-center text-center gap-3"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#ffdad9] text-[#7a3135] tracking-wide mb-1">
              Question
            </span>
            <p className="font-display text-base font-bold text-[#1b1c1c] leading-snug max-w-sm">
              {card.question}
            </p>
            <p className="text-xs text-[#a08888] mt-2">Click to reveal answer</p>
          </div>

          {/* Back — Answer */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#f0f4f3] border border-[#c8d8d4] shadow-sm p-7 flex flex-col items-center justify-center text-center gap-3"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#d9eae6] text-[#2e6257] tracking-wide mb-1">
              Answer
            </span>
            <p className="text-base font-semibold text-[#1b1c1c] leading-snug max-w-sm">
              {card.answer}
            </p>
            <p className="text-xs text-[#7a9e98] mt-2">Click to see question</p>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Progress indicator + navigation                                   */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-4 w-full justify-between">
        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#d7c2c1] text-[#524343] hover:bg-[#f0eded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Prev
        </button>

        {/* Card counter */}
        <span className="text-sm font-medium text-[#857372]">
          Card {index + 1} of {total}
        </span>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={index === total - 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-[#d7c2c1] text-[#524343] hover:bg-[#f0eded] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Dot progress strip */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFlipped(false); setTimeout(() => setIndex(i), 0) }}
            aria-label={`Go to card ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === index
                ? 'w-5 bg-[#8a4d4e]'
                : 'w-2 bg-[#d7c2c1] hover:bg-[#c4aaaa]'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default FlashcardDeck
