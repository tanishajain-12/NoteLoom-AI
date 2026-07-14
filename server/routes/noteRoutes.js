const express = require('express')
const router = express.Router()

const { summarize, getHistory, getHistoryById } = require('../controllers/noteController')

// No authentication on any of these routes — public API

// POST /api/summarize  — submit a transcript, get AI summary back + saved to DB
router.post('/summarize', summarize)

// GET  /api/history    — list all past summaries (transcript omitted)
router.get('/history', getHistory)

// GET  /api/history/:id — get one full summary including the original transcript
router.get('/history/:id', getHistoryById)

module.exports = router
