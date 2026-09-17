const express = require('express')
const router = express.Router()

const {
  protect,
  optionalAuth,
  requireRole,
} = require('../middleware/auth')

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
  cancelMyOrder,
} = require('../controllers/orderController')

// Guest checkout is allowed.
// If a customer is logged in, optionalAuth attaches req.auth.
router.post('/', optionalAuth, createOrder)

// Customer order history.
router.get(
  '/mine',
  protect,
  requireRole('customer'),
  getMyOrders
)

// Customer can cancel their own order.
router.put(
  '/:id/cancel',
  protect,
  requireRole('customer'),
  cancelMyOrder
)

// Admin order management.
router.get(
  '/',
  protect,
  requireRole('admin'),
  getAllOrders
)

router.put(
  '/:id/status',
  protect,
  requireRole('admin'),
  updateStatus
)

module.exports = router

