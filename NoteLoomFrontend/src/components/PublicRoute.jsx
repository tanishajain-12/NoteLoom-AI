import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

/**
 * PublicRoute
 *
 * Wraps pages that should only be visible to unauthenticated visitors
 * (Login, Signup).  If the visitor IS already authenticated, they are
 * redirected straight to /dashboard.
 *
 * Usage in App.jsx:
 *   <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default PublicRoute
