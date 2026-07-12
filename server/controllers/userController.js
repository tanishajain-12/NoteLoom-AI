const User = require('../models/User')
const asyncHandler = require('../utils/asyncHandler')

// ---------------------------------------------------------------------------
// @desc    Update current user's name or email
// @route   PUT /api/users/profile
// @access  Private
// ---------------------------------------------------------------------------
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Only update fields that are provided
  if (req.body.name) {
    const name = req.body.name.trim()
    if (name.length < 2 || name.length > 100) {
      res.status(422)
      throw new Error('Name must be between 2 and 100 characters')
    }
    user.name = name
  }

  if (req.body.email) {
    const email = req.body.email.trim().toLowerCase()
    const emailRegex = /^\S+@\S+\.\S+$/
    if (!emailRegex.test(email)) {
      res.status(422)
      throw new Error('Please provide a valid email address')
    }

    // Ensure no other account owns this email
    const taken = await User.findOne({ email, _id: { $ne: user._id } })
    if (taken) {
      res.status(409)
      throw new Error('That email address is already in use')
    }
    user.email = email
  }

  const updatedUser = await user.save()

  res.status(200).json({
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    createdAt: updatedUser.createdAt,
  })
})

// ---------------------------------------------------------------------------
// @desc    Delete the current user's account
// @route   DELETE /api/users/profile
// @access  Private
// ---------------------------------------------------------------------------
const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  await user.deleteOne()

  // Clear the auth cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  })

  res.status(200).json({ message: 'Account deleted successfully' })
})

module.exports = { updateProfile, deleteAccount }
