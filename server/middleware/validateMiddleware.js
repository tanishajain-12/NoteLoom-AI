/**
 * Input validation middleware.
 * Uses plain JS so there is no extra dependency.
 * Returns 422 with a descriptive message on the first validation failure.
 */

const EMAIL_REGEX = /^\S+@\S+\.\S+$/

/**
 * Validate signup body: name, email, password
 */
const validateSignup = (req, res, next) => {
  const { name, email, password } = req.body

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    res.status(422)
    return next(new Error('Name must be at least 2 characters'))
  }

  if (name.trim().length > 100) {
    res.status(422)
    return next(new Error('Name must be at most 100 characters'))
  }

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    res.status(422)
    return next(new Error('Please provide a valid email address'))
  }

  if (!password || password.length < 8) {
    res.status(422)
    return next(new Error('Password must be at least 8 characters'))
  }

  // Sanitise — trim whitespace from string fields
  req.body.name = name.trim()
  req.body.email = email.trim().toLowerCase()

  next()
}

/**
 * Validate login body: email, password
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    res.status(422)
    return next(new Error('Please provide a valid email address'))
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    res.status(422)
    return next(new Error('Password is required'))
  }

  req.body.email = email.trim().toLowerCase()

  next()
}

module.exports = { validateSignup, validateLogin }
