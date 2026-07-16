import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth'

/**
 * PrivateRoute
 *
 * Wraps any page that requires authentication.
 * If the visitor is NOT authenticated, they are redirected to /login.
 * The original destination is preserved in location.state.from so Login
 * can send them back after a successful login.
 *
 * Usage in App.jsx:
 *   <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
 */
function PrivateRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    // Pass the intended destination so Login can redirect back after auth
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default PrivateRoute
