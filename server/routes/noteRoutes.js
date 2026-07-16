const express = require('express')
const router = express.Router()

const { summarize, getHistory, getHistoryById, getStats } = require('../controllers/noteController')
const { protect } = require('../middleware/authMiddleware')

// All note routes are now private — every request must carry a valid JWT.
// The protect middleware reads the token from either the HttpOnly cookie
// or the Authorization: Bearer header and attaches req.user.

// POST /api/summarize  — submit a transcript, get AI summary back + saved to DB
router.post('/summarize', protect, summarize)

// GET  /api/notes/stats — dashboard statistics for the logged-in user
router.get('/notes/stats', protect, getStats)

// GET  /api/history    — list all summaries for the logged-in user
router.get('/history', protect, getHistory)

// GET  /api/history/:id — get one full summary (must belong to the user)
router.get('/history/:id', protect, getHistoryById)

module.exports = router
