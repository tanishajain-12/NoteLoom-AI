/**
 * Wraps an async Express route handler and forwards any errors to next().
 * Eliminates the need for try/catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler (req, res, next)
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

module.exports = asyncHandler
