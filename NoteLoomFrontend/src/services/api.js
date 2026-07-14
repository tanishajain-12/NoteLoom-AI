import axios from 'axios'

// All requests go to the Express server running on port 5000.
// Vite's dev server proxies are not used — the full base URL is explicit
// so it works whether Vite is running or not.
const BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 s — Gemini can be slow on longer transcripts
})

// ---------------------------------------------------------------------------
// Summarise a transcript
// POST /api/summarize
// Returns the full saved document: { _id, transcript, summary, keyPoints,
//   actionItems, quizQuestions, createdAt, updatedAt }
// ---------------------------------------------------------------------------
export const summarizeTranscript = (transcript) =>
  api.post('/summarize', { transcript }).then((res) => res.data)

// ---------------------------------------------------------------------------
// Fetch all past summaries (transcript field omitted by the server)
// GET /api/history
// Returns an array sorted newest-first
// ---------------------------------------------------------------------------
export const getHistory = () =>
  api.get('/history').then((res) => res.data)

// ---------------------------------------------------------------------------
// Fetch one complete summary including the original transcript
// GET /api/history/:id
// ---------------------------------------------------------------------------
export const getHistoryById = (id) =>
  api.get(`/history/${id}`).then((res) => res.data)
