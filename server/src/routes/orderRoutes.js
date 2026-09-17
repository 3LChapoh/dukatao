const express = require('express')
const router = express.Router()
const { protect, optionalAuth, requireRole, attachVendor, attachVendorIfVendor } = require('../middleware/auth')
const {
  createOrder,
  getMyOrders,
  getVendorOrders,
  getAllOrders,
  updateStatus,
  cancelMyOrder,
} = require('../controllers/orderController')

// guest checkout allowed; optionalAuth attaches req.auth if a customer is signed in
router.post('/', optionalAuth, createOrder)

router.get('/mine', protect, requireRole('customer'), getMyOrders)
router.put('/:id/cancel', protect, requireRole('customer'), cancelMyOrder)

router.get('/vendor', protect, requireRole('vendor'), attachVendor, getVendorOrders)

router.get('/', protect, requireRole('admin'), getAllOrders)
router.put('/:id/status', protect, requireRole('vendor', 'admin'), attachVendorIfVendor, updateStatus)

module.exports = router
