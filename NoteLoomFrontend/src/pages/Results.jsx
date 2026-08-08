import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import FlashcardDeck from '../components/FlashcardDeck'
import MultipleChoiceQuiz from '../components/MultipleChoiceQuiz'
import { Copy, Download, Check, BookOpen, LightBulb, Question } from '../icons'
import { exportInsightsPDF } from '../utils/exportPdf'

// ---------------------------------------------------------------------------
// Copy-to-clipboard button — UI unchanged
// ---------------------------------------------------------------------------
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
        copied
          ? 'bg-[#ffdad9] border-[#d7c2c1] text-[#592628]'
          : 'border-[#d7c2c1]/30 hover:bg-[#f6f3f2] text-[#524343]'
      }`}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Results page
// ---------------------------------------------------------------------------
function Results() {
  const location = useLocation()
  const navigate = useNavigate()

  // Data arrives via navigate('/results', { state: { summary: ... } })
  // from Dashboard, or via navigate('/results', { state: { summary: ... } })
  // from a HistoryCard click.
  const data = location.state?.summary

  const [checkedItems, setCheckedItems] = useState({})
  const toggleItem = (i) =>
    setCheckedItems((prev) => ({ ...prev, [i]: !prev[i] }))

  // -------------------------------------------------------------------------
  // Share handler
  // Uses the Web Share API when available (mobile / modern desktop browsers).
  // Falls back to copying the current URL to the clipboard on unsupported
  // browsers, and shows a brief "Link copied" confirmation label.
  // -------------------------------------------------------------------------
  const [shareFeedback, setShareFeedback] = useState('')

  const handleShare = async () => {
    const url   = window.location.href
    const title = 'NoteLoom AI — AI Insights'

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // User cancelled the share sheet — no feedback needed
      }
      return
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(url)
      setShareFeedback('Link copied to clipboard.')
      setTimeout(() => setShareFeedback(''), 2500)
    } catch {
      setShareFeedback('Could not copy link.')
      setTimeout(() => setShareFeedback(''), 2500)
    }
  }

  // Graceful fallback if the page is visited directly without state
  if (!data) {
    return (
      <AppLayout title="Your AI Insights">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffdad9] mb-4">
            <BookOpen className="w-7 h-7 text-[#8a4d4e]" />
          </div>
          <h3 className="font-display text-lg font-bold text-[#1b1c1c]">No summary to display</h3>
          <p className="mt-1 text-sm text-[#524343] mb-6">
            Generate a summary from the Dashboard, or pick one from your History.
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </AppLayout>
    )
  }

  const { summary, keyPoints = [], actionItems = [], quizQuestions = [], flashcards = [], createdAt } = data

  // Format the date shown in the sub-heading
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <AppLayout title="Your AI Insights">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#8a4d4e]">Your AI Insights</h2>
          {formattedDate && (
            <p className="text-sm text-[#524343] mt-1">{formattedDate}</p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          New Summary
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Summary — full width */}
        <section className="lg:col-span-12 glass-card rounded-xl p-6 shadow-sm relative overflow-hidden group bg-white/80 backdrop-blur-sm border border-[#e4e2e1]/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad9]">
                <BookOpen className="w-5 h-5 text-[#8a4d4e]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Summary</h3>
            </div>
            <CopyButton text={summary} />
          </div>
          <p className="text-base leading-relaxed text-[#524343] max-w-4xl">{summary}</p>
          <div className="absolute -right-4 -bottom-4 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity pointer-events-none">
            <svg className="w-36 h-36 text-[#8a4d4e]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
            </svg>
          </div>
        </section>

        {/* Key Points — 7 cols */}
        <section className="lg:col-span-7 glass-card rounded-xl p-6 shadow-sm bg-white/80 backdrop-blur-sm border border-[#e4e2e1]/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d9e4ec]">
                <LightBulb className="w-5 h-5 text-[#556066]" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Key Points</h3>
            </div>
            <button className="text-xs font-semibold text-[#8a4d4e] hover:underline flex items-center gap-1" onClick={() => exportInsightsPDF(data)}>
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </button>
          </div>
          <ul className="space-y-4">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#8a4d4e]"></div>
                <p className="text-base leading-relaxed text-[#524343]">{point}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Action Items — 5 cols */}
        <section className="lg:col-span-5 glass-card rounded-xl p-6 shadow-sm border-l-4 border-[#8a4d4e] bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffb3b3]">
              <Check className="w-5 h-5 text-[#8a4d4e]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Action Items</h3>
          </div>
          <div className="space-y-2">
            {actionItems.length === 0 ? (
              <p className="text-sm text-[#857372]">No action items found in this transcript.</p>
            ) : (
              actionItems.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f6f3f2] cursor-pointer transition-colors group"
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[i]}
                    onChange={() => toggleItem(i)}
                    className="h-5 w-5 rounded border-[#d7c2c1] text-[#8a4d4e] focus:ring-[#8a4d4e]/30 cursor-pointer"
                  />
                  <span
                    className={`text-base text-[#524343] group-hover:text-[#1b1c1c] transition-colors leading-snug ${
                      checkedItems[i] ? 'line-through opacity-60' : ''
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))
            )}
          </div>
        </section>

        {/* Flashcards — full width, shown only when cards exist */}
        {flashcards.length > 0 && (
          <section className="lg:col-span-12 glass-card rounded-xl p-6 shadow-sm bg-white/80 backdrop-blur-sm border border-[#e4e2e1]/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffdad9]">
                {/* Card-stack icon */}
                <svg className="w-5 h-5 text-[#8a4d4e]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Flashcards</h3>
                <p className="text-xs text-[#857372] mt-0.5">{flashcards.length} cards · click a card to flip it</p>
              </div>
            </div>
            {/* Constrain the deck width on wide screens for comfortable reading */}
            <div className="max-w-xl mx-auto">
              <FlashcardDeck cards={flashcards} />
            </div>
          </section>
        )}

        {/* Quiz — full width, hidden when no questions */}
        {quizQuestions.length > 0 && (
          <section className="lg:col-span-12 glass-card rounded-xl p-6 shadow-sm bg-white/80 backdrop-blur-sm border border-[#e4e2e1]/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7e1e1]">
                <Question className="w-5 h-5 text-[#615d5e]" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Knowledge Check</h3>
                <p className="text-xs text-[#857372] mt-0.5">{quizQuestions.length} multiple-choice questions</p>
              </div>
            </div>
            <MultipleChoiceQuiz questions={quizQuestions} />
          </section>
        )}
      </div>

      {/* Bottom export bar */}
      <div className="mt-6 flex flex-col items-center gap-2 py-4 border-t border-[#e4e2e1]">
        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="md" onClick={handleShare}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
            </svg>
            Share
          </Button>
          <Button variant="primary" size="md" onClick={() => exportInsightsPDF(data)}>
            <Download className="w-4 h-4" />
            Export Insights
          </Button>

          
        </div>
        {/* Clipboard fallback feedback — only shown when Web Share API is unavailable */}
        {shareFeedback && (
          <p className="text-xs text-[#524343] animate-pulse">{shareFeedback}</p>
        )}
      </div>
    </AppLayout>
  )
}

export default Results
