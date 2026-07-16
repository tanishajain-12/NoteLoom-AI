const jwt = require('jsonwebtoken')

/**
 * Signs a JWT containing the user's id and sends it as an HttpOnly cookie.
 * Also returns the token string so it can be sent in the JSON response body.
 *
 * Cookie strategy:
 *   - Development (same-origin, localhost): sameSite 'lax' works fine.
 *   - Production (cross-origin, e.g. Vercel frontend → Render backend):
 *     browsers block 'strict' and 'lax' cookies on cross-site requests, so
 *     we switch to sameSite 'none' + secure:true (HTTPS required).
 *
 * The token is also returned in the JSON body so the frontend can store it in
 * localStorage as a reliable fallback for cross-origin deployments.
 *
 * @param {Object} res    - Express response object
 * @param {string} userId - MongoDB ObjectId (as string)
 * @returns {string} Signed JWT
 */
const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  })

  const isProduction = process.env.NODE_ENV === 'production'

  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,                          // HTTPS only in prod
    sameSite: isProduction ? 'none' : 'lax',       // 'none' allows cross-origin in prod
    maxAge: 30 * 24 * 60 * 60 * 1000,             // 30 days in ms
  })

  return token
}

module.exports = generateToken
