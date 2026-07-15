import axios from 'axios'

// Base URL is read from the VITE_API_URL environment variable so the same
// build can be pointed at any backend (local dev, staging, production) without
// changing source code.  Set VITE_API_URL in your .env file (see .env.example).
const API_URL = import.meta.env.VITE_API_URL
const BASE_URL = `${API_URL}/api`

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
// Returns an array sorted newest-first.
//
// Normalises the response so callers always receive a plain array regardless
// of whether the backend returns:
//   - a bare array:              [{ ... }, ...]          ← ideal
//   - an envelope with "data":   { data: [...] }
//   - an envelope with "notes":  { notes: [...] }
//   - anything else unexpected:  []                      ← safe fallback
// ---------------------------------------------------------------------------
export const getHistory = () =>
  api.get('/history').then((res) => {
    const payload = res.data
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.notes)) return payload.notes
    return []
  })

// ---------------------------------------------------------------------------
// Fetch one complete summary including the original transcript
// GET /api/history/:id
// ---------------------------------------------------------------------------
export const getHistoryById = (id) =>
  api.get(`/history/${id}`).then((res) => res.data)
