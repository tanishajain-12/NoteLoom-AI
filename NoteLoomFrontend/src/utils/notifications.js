/**
 * notifications.js
 *
 * Client-side notification store backed by localStorage.
 * No React dependency — importable from pages, utilities, and components alike.
 *
 * Storage key: 'nl_notifications'
 * Shape:  Array<{ id, message, type, timestamp, read }>
 *   id        — crypto.randomUUID() or Date.now() fallback
 *   message   — human-readable description
 *   type      — 'success' | 'info' | 'warning' | 'error'
 *   timestamp — ISO string
 *   read      — boolean
 *
 * Newest notifications are at index 0.
 * A maximum of 50 notifications are kept to avoid unbounded localStorage growth.
 */

const STORAGE_KEY = 'nl_notifications'
const MAX_ITEMS   = 50

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function makeId() {
  try {
    return crypto.randomUUID()
  } catch {
    return String(Date.now()) + Math.random().toString(36).slice(2)
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Add a new notification.
 * Returns the created notification object.
 *
 * @param {string} message
 * @param {'success'|'info'|'warning'|'error'} [type='success']
 */
export function addNotification(message, type = 'success') {
  const item = {
    id:        makeId(),
    message,
    type,
    timestamp: new Date().toISOString(),
    read:      false,
  }

  const existing = load()
  // Prepend newest first, cap at MAX_ITEMS
  const updated = [item, ...existing].slice(0, MAX_ITEMS)
  save(updated)
  return item
}

/**
 * Return all notifications, newest first.
 */
export function getNotifications() {
  return load()
}

/**
 * Return the count of unread notifications.
 */
export function getUnreadCount() {
  return load().filter((n) => !n.read).length
}

/**
 * Mark all notifications as read.
 */
export function markAllRead() {
  const updated = load().map((n) => ({ ...n, read: true }))
  save(updated)
}

/**
 * Delete a single notification by id.
 */
export function deleteNotification(id) {
  const updated = load().filter((n) => n.id !== id)
  save(updated)
}

/**
 * Delete all notifications.
 */
export function clearAllNotifications() {
  save([])
}
