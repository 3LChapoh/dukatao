const express = require('express')
const router = express.Router()
const { protect, optionalAuth, requireRole } = require('../middleware/auth')
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
  cancelMyOrder,
} = require('../controllers/orderController')

// guest checkout allowed; optionalAuth attaches req.auth if a customer is signed in
router.post('/', optionalAuth, createOrder)

router.get('/mine', protect, requireRole('customer'), getMyOrders)
router.put('/:id/cancel', protect, requireRole('customer'), cancelMyOrder)

router.get('/', protect, requireRole('admin'), getAllOrders)
router.put('/:id/status', protect, requireRole('admin'), updateStatus)

module.exports = router
