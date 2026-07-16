import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../services/api'
import { clearAuthStorage } from '../utils/auth'

export function useLogout() {
  const navigate = useNavigate()

  return async () => {
    try {
      // Tell the backend to clear the HttpOnly cookie
      await logoutUser()
    } catch {
      // If the request fails (expired token, network error) still clear
      // client-side storage so the user isn't stuck on the dashboard.
    }

    // Always clear client-side auth state via the shared helper
    clearAuthStorage()

    navigate('/')
  }
}
