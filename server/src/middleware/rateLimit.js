const rateLimit = require('express-rate-limit')

// Applies to login endpoints: 10 attempts per 15 minutes per IP.
// Keeps normal typos/retries working while blocking brute-force scripts
// against admin-login and customer login.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
})

module.exports = { authLimiter }
