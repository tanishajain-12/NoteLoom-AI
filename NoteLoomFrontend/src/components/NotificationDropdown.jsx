import { useState, useEffect, useRef } from 'react'
import { Bell } from '../icons'
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  deleteNotification,
  clearAllNotifications,
} from '../utils/notifications'

// ---------------------------------------------------------------------------
// Icon map — small coloured dot next to each notification type
// ---------------------------------------------------------------------------
const TYPE_STYLES = {
  success: 'bg-[#8a4d4e]',
  info:    'bg-[#556066]',
  warning: 'bg-[#b08000]',
  error:   'bg-[#93000a]',
}

// ---------------------------------------------------------------------------
// Format a timestamp into a relative label ("Just now", "2 min ago", etc.)
// ---------------------------------------------------------------------------
function relativeTime(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 10)  return 'Just now'
  if (diff < 60)  return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ---------------------------------------------------------------------------
// NotificationDropdown
//
// Self-contained — manages its own open/close state and re-reads localStorage
// every time it opens so it always shows the latest notifications.
// ---------------------------------------------------------------------------
function NotificationDropdown() {
  const [open,         setOpen]         = useState(false)
  const [items,        setItems]        = useState([])
  const [unreadCount,  setUnreadCount]  = useState(0)
  const dropdownRef = useRef(null)

  // Refresh the unread badge on mount and whenever localStorage changes
  // (e.g. a notification is added by another part of the app).
  useEffect(() => {
    function refresh() {
      setUnreadCount(getUnreadCount())
    }
    refresh()

    // Listen for storage events so the badge updates when a notification is
    // added from a different page (same-tab storage events don't fire, but
    // this covers multi-tab scenarios).
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  // Close the dropdown when clicking outside it
  useEffect(() => {
    if (!open) return
    function handleOutsideClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  function handleOpen() {
    const latest = getNotifications()
    setItems(latest)
    setOpen(true)
    // Mark all as read as soon as the panel opens
    markAllRead()
    setUnreadCount(0)
  }

  function handleClose() {
    setOpen(false)
  }

  function handleToggle() {
    open ? handleClose() : handleOpen()
  }

  function handleDelete(id) {
    deleteNotification(id)
    setItems((prev) => prev.filter((n) => n.id !== id))
  }

  function handleClearAll() {
    clearAllNotifications()
    setItems([])
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell button (existing UI preserved exactly) ── */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-[#f0eded] transition-colors"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="w-5 h-5 text-[#524343]" />
        {/* Red dot — only visible when there are unread notifications */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#8a4d4e]" />
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white border border-[#e4e2e1] shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0eded] bg-[#f6f3f2]">
            <h3 className="text-sm font-semibold text-[#1b1c1c]">Notifications</h3>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-[#857372] hover:text-[#8a4d4e] transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-[#f0eded]">
            {items.length === 0 ? (
              <li className="flex flex-col items-center justify-center py-10 px-4 text-center">
                {/* Bell illustration */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ffdad9] mb-3">
                  <Bell className="w-5 h-5 text-[#8a4d4e]" />
                </div>
                <p className="text-sm font-medium text-[#1b1c1c]">No notifications yet</p>
                <p className="text-xs text-[#857372] mt-1">
                  Activity like summaries, profile updates, and exports will appear here.
                </p>
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-[#fafaf9] transition-colors group"
                >
                  {/* Type indicator dot */}
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${TYPE_STYLES[n.type] ?? TYPE_STYLES.info}`}
                  />

                  {/* Message + timestamp */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#1b1c1c] leading-snug">{n.message}</p>
                    <p className="text-xs text-[#857372] mt-0.5">{relativeTime(n.timestamp)}</p>
                  </div>

                  {/* Dismiss button — appears on hover */}
                  <button
                    onClick={() => handleDelete(n.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#857372] hover:text-[#8a4d4e]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
