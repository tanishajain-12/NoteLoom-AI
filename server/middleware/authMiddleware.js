const jwt = require('jsonwebtoken')
const asyncHandler = require('../utils/asyncHandler')
const User = require('../models/User')

/**
 * protect — verifies a JWT from either:
 *   1. The HttpOnly cookie  (`req.cookies.token`)
 *   2. The Authorization header (`Bearer <token>`) for API clients / testing
 *
 * Attaches the authenticated user (without password) to `req.user`.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token

  // 1. Check HttpOnly cookie first (preferred for browser clients)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  }
  // 2. Fallback: Authorization header (useful for Postman / mobile clients)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized — no token provided')
  }

  // Verify the token
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  // Fetch user from DB, exclude password field
  const user = await User.findById(decoded.id).select('-password')

  if (!user) {
    res.status(401)
    throw new Error('Not authorized — user no longer exists')
  }

  req.user = user
  next()
})

module.exports = { protect }
