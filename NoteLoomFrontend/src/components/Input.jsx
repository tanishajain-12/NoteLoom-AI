import { useId } from 'react'

function Input({
  label,
  type = 'text',
  error,
  hint,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#524343] mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#857372] pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          className={`w-full rounded-xl border border-[#d7c2c1] bg-white px-4 py-2.5 text-sm text-[#1b1c1c] placeholder:text-[#857372]/60 focus:outline-none focus:ring-2 focus:ring-[#8a4d4e]/30 focus:border-[#8a4d4e] transition-all ${Icon ? 'pl-10' : ''} ${error ? 'border-[#ba1a1a]' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-[#ba1a1a]">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-[#857372]">{hint}</p>}
    </div>
  )
}

export default Input
