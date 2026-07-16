const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const asyncHandler = require('../utils/asyncHandler')

// ---------------------------------------------------------------------------
// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
// ---------------------------------------------------------------------------
const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  // Check if email is already registered
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    res.status(409)
    throw new Error('An account with that email already exists')
  }

  // Create user — password is hashed in the pre-save hook on the model
  const user = await User.create({ name, email, password })

  // Issue JWT (sets HttpOnly cookie + returns token string)
  const token = generateToken(res, user._id)

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    token,
  })
})

// ---------------------------------------------------------------------------
// @desc    Login an existing user
// @route   POST /api/auth/login
// @access  Public
// ---------------------------------------------------------------------------
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Explicitly select password (field has select:false on the model)
  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  const token = generateToken(res, user._id)

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    token,
  })
})

// ---------------------------------------------------------------------------
// @desc    Get current logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private (requires valid JWT)
// ---------------------------------------------------------------------------
const getProfile = asyncHandler(async (req, res) => {
  // req.user is attached by the protect middleware
  const user = req.user

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  })
})

// ---------------------------------------------------------------------------
// @desc    Log out — clears the HttpOnly token cookie
// @route   POST /api/auth/logout
// @access  Public — intentionally no protect middleware so a client with an
//          expired token can still clear their cookie cleanly.
// ---------------------------------------------------------------------------
const logout = asyncHandler(async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production'

  // Overwrite the cookie with an empty value that expires immediately.
  // sameSite must match the setting used when the cookie was set so the
  // browser actually clears it (especially important cross-origin in prod).
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0), // Jan 1 1970 — forces immediate expiry
  })

  res.status(200).json({ message: 'Logged out successfully' })
})

module.exports = { signup, login, getProfile, logout }
