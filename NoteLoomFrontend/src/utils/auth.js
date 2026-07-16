/**
 * auth.js — client-side authentication helpers
 *
 * Single source of truth for checking whether the current visitor is
 * authenticated.  All route guards import from here so the logic only
 * lives in one place.
 *
 * Storage strategy (set during login / signup):
 *   localStorage.user      — JSON { _id, name, email }
 *   localStorage.authToken — JWT string returned in the response body
 *
 * A user is considered authenticated when BOTH keys are present and the
 * user object can be parsed successfully.  The token itself is not decoded
 * client-side — the backend validates it on every protected API call.
 */

/**
 * Returns true when the visitor has a stored auth session.
 * Survives page refreshes because localStorage is persistent.
 */
export function isAuthenticated() {
  try {
    const token = localStorage.getItem('authToken')
    const raw   = localStorage.getItem('user')
    if (!token || !raw) return false

    const user = JSON.parse(raw)
    // Minimal sanity check — make sure it looks like a real user object
    return Boolean(user && user._id && user.email)
  } catch {
    return false
  }
}

/**
 * Returns the stored user object, or null if not authenticated.
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Clears all auth-related keys from localStorage.
 * Call this on logout in addition to the backend cookie-clear request.
 */
export function clearAuthStorage() {
  try {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  } catch {
    // localStorage unavailable — nothing to clear
  }
}

/**
 * Updates the stored user object in localStorage with new field values.
 * Only the provided fields are overwritten; others are preserved.
 * Call this after a successful profile update so the UI stays in sync
 * without requiring a full re-login.
 *
 * @param {Partial<{_id: string, name: string, email: string}>} patch
 */
export function updateStoredUser(patch) {
  try {
    const raw  = localStorage.getItem('user')
    const user = raw ? JSON.parse(raw) : {}
    localStorage.setItem('user', JSON.stringify({ ...user, ...patch }))
  } catch {
    // Ignore storage errors — the next page load will re-fetch from the server
  }
}
