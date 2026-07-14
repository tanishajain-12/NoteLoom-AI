import { useId } from 'react'

function Textarea({ label, error, hint, className = '', id, ...props }) {
  const generatedId = useId()
  const textareaId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#524343] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full rounded-xl border border-[#d7c2c1] bg-white px-4 py-3 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e] transition-all resize-y min-h-[120px] ${error ? 'border-[#ba1a1a]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[#857372]">{hint}</p>}
    </div>
  )
}

export default Textarea
