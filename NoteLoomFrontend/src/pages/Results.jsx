import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import Button from '../components/Button'
import { Copy, Download, ChevronDown, Check, BookOpen, LightBulb, Question } from '../icons'

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
// QuizItem — backend returns { question, answer } with no options array.
// Renders as an accordion: click to expand, then "Reveal Answer" button.
// Visual style (rounded card, chevron, colours) is preserved exactly.
// ---------------------------------------------------------------------------
function QuizItem({ q, index }) {
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-xl bg-[#f6f3f2] border border-[#e4e2e1]/60 overflow-hidden">
      {/* Question header — click to expand */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left text-xs font-semibold text-[#1b1c1c] uppercase tracking-wide"
      >
        <span>Q{index + 1}: {q.question}</span>
        <ChevronDown className={`w-5 h-5 text-[#857372] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-4 pb-4">
          {!revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="w-full rounded-xl border border-[#d7c2c1] px-4 py-2.5 text-sm text-[#524343] hover:bg-white transition-colors text-left"
            >
              Tap to reveal answer
            </button>
          ) : (
            <div className="rounded-xl bg-[#ffdad9] px-4 py-2.5 text-sm text-[#592628] font-medium leading-relaxed">
              {q.answer}
            </div>
          )}
        </div>
      )}
    </div>
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

  const { summary, keyPoints = [], actionItems = [], quizQuestions = [], createdAt } = data

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
            <button className="text-xs font-semibold text-[#8a4d4e] hover:underline flex items-center gap-1">
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

        {/* Quiz — 8 cols */}
        <section className="lg:col-span-8 glass-card rounded-xl p-6 shadow-sm bg-white/80 backdrop-blur-sm border border-[#e4e2e1]/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e7e1e1]">
              <Question className="w-5 h-5 text-[#615d5e]" />
            </div>
            <h3 className="font-display text-xl font-bold text-[#1b1c1c]">Knowledge Check</h3>
          </div>
          <div className="space-y-3">
            {quizQuestions.length === 0 ? (
              <p className="text-sm text-[#857372]">No quiz questions generated for this transcript.</p>
            ) : (
              quizQuestions.map((q, i) => (
                <QuizItem key={i} q={q} index={i} />
              ))
            )}
          </div>
        </section>

        {/* Utility panel — 4 cols (static UI, unchanged) */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          <div className="relative overflow-hidden rounded-xl bg-[#8a4d4e] p-6 shadow-lg flex-1 min-h-[200px]">
            <div className="relative z-10">
              <h4 className="font-display text-xl font-bold text-white mb-2">Master Your Learning</h4>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Convert these insights into flashcards for your spaced repetition system.
              </p>
              <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-[#8a4d4e] hover:bg-white/90 transition-all">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
                Create Flashcards
              </button>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
          </div>

          <div className="glass-card rounded-xl p-6 flex items-center justify-between border-2 border-dashed border-[#d7c2c1]/30 bg-white/80">
            <div>
              <p className="text-sm text-[#556066]">Audio version ready</p>
              <p className="text-xs font-semibold text-[#1b1c1c] mt-0.5">8:42 mins duration</p>
            </div>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-[#d9e4ec] text-[#556066] transition-transform hover:scale-110 active:scale-95">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* Bottom export bar */}
      <div className="mt-6 flex items-center justify-center gap-4 py-4 border-t border-[#e4e2e1]">
        <Button variant="secondary" size="md">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
          </svg>
          Share
        </Button>
        <Button variant="primary" size="md">
          <Download className="w-4 h-4" />
          Export Insights
        </Button>
      </div>
    </AppLayout>
  )
}

export default Results
