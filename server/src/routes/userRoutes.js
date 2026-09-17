const express = require('express')
const router = express.Router()
const { protect, attachUser } = require('../middleware/auth')
const { authLimiter } = require('../middleware/rateLimit')
const { register, login, adminLogin, getMe, updateMe } = require('../controllers/userController')

router.post('/register', register)
router.post('/login', authLimiter, login)
router.post('/admin-login', authLimiter, adminLogin)
router.get('/me', protect, attachUser, getMe)
router.put('/me', protect, attachUser, updateMe)

module.exports = router
