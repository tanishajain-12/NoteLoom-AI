const express = require('express')
const router = express.Router()

const { updateProfile, deleteAccount } = require('../controllers/userController')
const { getProfile } = require('../controllers/authController')
const { protect } = require('../middleware/authMiddleware')

// GET /api/users/profile — returns the logged-in user's info.
// This satisfies the "GET /api/users/profile (protected)" requirement.
// The same data is also available at GET /api/auth/profile.
router.get('/profile', protect, getProfile)

// PUT /api/users/profile  — update name or email
// DELETE /api/users/profile — delete account
router.put('/profile', protect, updateProfile)
router.delete('/profile', protect, deleteAccount)

module.exports = router
