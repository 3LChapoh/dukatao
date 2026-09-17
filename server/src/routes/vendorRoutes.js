const express = require('express')
const router = express.Router()
const { protect, requireRole, attachVendor } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { login, getMe } = require('../controllers/vendorController')

// Single-vendor store: there is no public application/approval pipeline.
// The one boutique account is created directly via server/src/seed/seedVendor.js.
router.post('/login', authLimiter, login)
router.get('/me', protect, requireRole('vendor'), attachVendor, getMe)

module.exports = router
