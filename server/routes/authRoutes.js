const express = require('express')
const router = express.Router()

const { signup, login, getProfile, logout } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { validateSignup, validateLogin } = require('../middleware/validateMiddleware')

// Public routes
// /register and /signup are aliases — both do the same thing.
// /register satisfies the standard REST convention; /signup keeps backward compat.
router.post('/register', validateSignup, signup)
router.post('/signup', validateSignup, signup)

router.post('/login', validateLogin, login)

// Logout is public — a client with an expired or missing token should still
// be able to hit this endpoint to clear any residual cookie on their browser.
router.post('/logout', logout)

// Protected routes
router.get('/profile', protect, getProfile)

module.exports = router
