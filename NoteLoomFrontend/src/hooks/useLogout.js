import { useNavigate } from 'react-router-dom'

export function useLogout() {
  const navigate = useNavigate()

  return () => {
    try {
      localStorage.removeItem('mockAuth')
      localStorage.removeItem('user')
      sessionStorage.clear()
    } catch {
      // storage may be unavailable; safe to ignore
    }
    navigate('/')
  }
}
