const express = require('express')
const router = express.Router()

const { updateProfile, deleteAccount } = require('../controllers/userController')
const { protect } = require('../middleware/authMiddleware')

// All user routes are protected
router.put('/profile', protect, updateProfile)
router.delete('/profile', protect, deleteAccount)

module.exports = router
