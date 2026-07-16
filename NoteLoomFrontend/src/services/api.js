import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL
const BASE_URL = `${API_URL}/api`

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
  withCredentials: true, // send/receive HttpOnly cookies cross-origin
})

// ---------------------------------------------------------------------------
// Request interceptor — attach the JWT from localStorage as a Bearer token.
// This is the fallback for cross-origin deployments where the HttpOnly cookie
// may not be forwarded automatically (e.g. Vercel frontend → Render backend
// with SameSite restrictions).  Both the cookie AND the header are sent;
// the backend protect middleware accepts whichever arrives first.
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

// POST /api/auth/register
export const registerUser = (name, email, password, acceptedTerms) =>
  api.post('/auth/register', { name, email, password, acceptedTerms }).then((res) => res.data)

// POST /api/auth/login
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data)

// POST /api/auth/logout
export const logoutUser = () =>
  api.post('/auth/logout').then((res) => res.data)

// ---------------------------------------------------------------------------
// User profile
// ---------------------------------------------------------------------------

// GET /api/users/profile  — returns { _id, name, email, createdAt }
export const getUserProfile = () =>
  api.get('/users/profile').then((res) => res.data)

// PUT /api/users/profile  — body: { name }  returns updated user object
export const updateUserProfile = (fields) =>
  api.put('/users/profile', fields).then((res) => res.data)

// ---------------------------------------------------------------------------
// Notes — stats
// ---------------------------------------------------------------------------

// GET /api/notes/stats  — returns { totalNotes, hoursSaved, quizzesTaken, avgAccuracy }
export const getStats = () =>
  api.get('/notes/stats').then((res) => res.data)

// ---------------------------------------------------------------------------
// Notes — summarise
// ---------------------------------------------------------------------------

// POST /api/summarize
export const summarizeTranscript = (transcript) =>
  api.post('/summarize', { transcript }).then((res) => res.data)

// ---------------------------------------------------------------------------
// Notes — history
// ---------------------------------------------------------------------------

// GET /api/history  (user-scoped, array normalised)
export const getHistory = () =>
  api.get('/history').then((res) => {
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.notes)) return payload.notes
    return []
  })

// GET /api/history/:id
export const getHistoryById = (id) =>
  api.get(`/history/${id}`).then((res) => res.data)
