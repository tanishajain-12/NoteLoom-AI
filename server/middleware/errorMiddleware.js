/**
 * 404 handler — catches requests for routes that don't exist.
 * Must be placed AFTER all route registrations.
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`)
  res.status(404)
  next(error)
}

/**
 * Global error handler — catches every error forwarded via next(err).
 * Returns a consistent JSON shape:
 *   { message: string, stack: string | undefined }
 *
 * Stack trace is only included in development.
 */
const errorHandler = (err, req, res, next) => {
  // If the status code is still 200 (Express default), normalise to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Mongoose duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(409).json({
      message: `An account with that ${field} already exists`,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(422).json({
      message: messages.join('. '),
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Invalid token',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expired — please log in again',
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    })
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  })
}

module.exports = { notFound, errorHandler }
