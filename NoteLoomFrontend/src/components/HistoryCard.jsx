import { Clock, FileText, ChevronRight } from '../icons'

// HistoryCard now receives backend documents instead of mock data.
//
// Backend shape:
//   _id        — MongoDB ObjectId string
//   summary    — paragraph text (used as the card preview)
//   keyPoints  — array of strings (first item used as a fallback preview)
//   createdAt  — ISO date string
//
// Props:
//   note     — the backend document
//   onClick  — called when the card is clicked (History page handles the fetch)
//   loading  — shows a subtle spinner overlay while this card's data is loading

function HistoryCard({ note, onClick, loading = false }) {
  const { summary = '', keyPoints = [], createdAt } = note

  // Build a short preview: first 120 chars of the summary,
  // or fall back to the first key point if summary is empty
  const preview = summary
    ? summary.slice(0, 120) + (summary.length > 120 ? '…' : '')
    : keyPoints[0] || 'No preview available'

  // Format the date as "Jul 10, 2026"
  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : ''

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="block w-full text-left rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 hover:shadow-md hover:border-[#d7c2c1] transition-all group disabled:opacity-60 disabled:cursor-wait"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ffdad9] text-[#592628]">
              Summary
            </span>
          </div>

          {/* Preview text */}
          <p className="text-sm text-[#524343] line-clamp-2 leading-relaxed">{preview}</p>

          {/* Date */}
          {formattedDate && (
            <div className="flex items-center gap-1 mt-3 text-xs text-[#857372]">
              <FileText className="w-3.5 h-3.5" />
              {formattedDate}
            </div>
          )}
        </div>

        {loading ? (
          /* Minimal spinner — same size as the chevron it replaces */
          <svg
            className="w-5 h-5 text-[#8a4d4e] shrink-0 mt-1 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <ChevronRight className="w-5 h-5 text-[#857372] group-hover:text-[#8a4d4e] shrink-0 mt-1" />
        )}
      </div>
    </button>
  )
}

export default HistoryCard
