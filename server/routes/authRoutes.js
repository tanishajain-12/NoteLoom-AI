const express = require('express')
const router = express.Router()

const { signup, login, getProfile, logout } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')
const { validateSignup, validateLogin } = require('../middleware/validateMiddleware')

// Public routes
router.post('/signup', validateSignup, signup)
router.post('/login', validateLogin, login)

// Protected routes
router.get('/profile', protect, getProfile)
router.post('/logout', protect, logout)

module.exports = router
