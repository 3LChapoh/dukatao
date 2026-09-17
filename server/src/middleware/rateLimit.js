const rateLimit = require('express-rate-limit')

// Applies to login/activation endpoints: 10 attempts per 15 minutes per IP.
// Keeps normal typos/retries working while blocking brute-force scripts
// against admin-login (password + security key) and vendor activation
// (a 6-digit PIN — only 900,000 combinations).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again later' },
})

module.exports = { authLimiter }
