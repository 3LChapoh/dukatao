const express = require('express')
const router = express.Router()

const {
  protect,
  attachUser,
} = require('../middleware/auth')

const { authLimiter } = require('../middleware/rateLimit')

const {
  register,
  login,
  adminLogin,
  getMe,
  updateMe,
  changePassword,
} = require('../controllers/userController')

// Customer authentication
router.post('/register', register)
router.post('/login', authLimiter, login)

// Customer and admin authentication
router.post('/admin-login', authLimiter, adminLogin)

// Authenticated user
router.get('/me', protect, attachUser, getMe)
router.put('/me', protect, attachUser, updateMe)

// Change own password
router.put(
  '/change-password',
  protect,
  attachUser,
  changePassword
)

module.exports = router
