import Button from './Button'
import { Copy, Download } from '../icons'

function SummaryCard({ title, content, items, type = 'text' }) {
  const handleCopy = () => {
    if (type === 'list' && items) {
      navigator.clipboard?.writeText(items.map((i, idx) => `${idx + 1}. ${i}`).join('\n'))
    } else {
      navigator.clipboard?.writeText(content || '')
    }
  }

  return (
    <div className="rounded-2xl bg-white border border-[#e4e2e1] shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-[#1b1c1c]">{title}</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#524343] bg-[#f0eded] hover:bg-[#e4e2e1] transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#524343] bg-[#f0eded] hover:bg-[#e4e2e1] transition-colors">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>

      {type === 'list' && items ? (
        <ul className="space-y-2.5">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-[#1b1c1c] leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ffdad9] text-[#592628] text-xs font-semibold mt-0.5">
                {idx + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[#1b1c1c] leading-relaxed">{content}</p>
      )}
    </div>
  )
}

export default SummaryCard
