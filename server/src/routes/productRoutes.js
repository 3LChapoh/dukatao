const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')
const { protect, requireRole, attachVendorIfVendor, attachVendor } = require('../middleware/auth')
const {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

router.get('/', getProducts)
router.get('/mine', protect, requireRole('vendor'), attachVendor, getMyProducts)
router.get('/:id', getProductById)

router.post(
  '/',
  protect,
  requireRole('vendor', 'admin'),
  attachVendorIfVendor,
  upload.array('images', 5),
  createProduct
)
router.put(
  '/:id',
  protect,
  requireRole('vendor', 'admin'),
  attachVendorIfVendor,
  upload.array('images', 5),
  updateProduct
)
router.delete('/:id', protect, requireRole('vendor', 'admin'), attachVendorIfVendor, deleteProduct)

module.exports = router
