import { useEffect } from 'react'
import { X } from '../icons'

function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#e4e2e1] shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e2e1]">
          <h3 className="font-display text-lg font-bold text-[#1b1c1c]">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#f0eded]">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-[#e4e2e1] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
