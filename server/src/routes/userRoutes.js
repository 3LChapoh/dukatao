const express = require('express')
const router = express.Router()
const { protect, attachUser } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { register, login, adminLogin, adminSignup, adminResetPassword, getMe, updateMe } = require('../controllers/userController')

router.post('/register', register)
router.post('/login', authLimiter, login)
router.post('/admin-login', authLimiter, adminLogin)
router.post('/admin-signup', authLimiter, adminSignup)
router.post('/admin-reset-password', authLimiter, adminResetPassword)
router.get('/me', protect, attachUser, getMe)
router.put('/me', protect, attachUser, updateMe)

module.exports = router
