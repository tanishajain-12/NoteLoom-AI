const jwt = require('jsonwebtoken')

/**
 * Signs a JWT containing the user's id and sends it as an HttpOnly cookie.
 * Also returns the token string so it can be sent in the JSON response body.
 *
 * @param {Object} res    - Express response object
 * @param {string} userId - MongoDB ObjectId (as string)
 * @returns {string} Signed JWT
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })

  // HttpOnly cookie — not accessible via JS, mitigates XSS
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  })

  return token
}

module.exports = generateToken
