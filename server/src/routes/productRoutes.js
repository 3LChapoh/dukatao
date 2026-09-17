const express = require('express')
const router = express.Router()
const upload = require('../middleware/upload')

const {
  protect,
  requireRole,
} = require('../middleware/auth')

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController')

// Public storefront
router.get('/', getProducts)
router.get('/:id', getProductById)

// Admin product management
router.post(
  '/',
  protect,
  requireRole('admin'),
  upload.array('images', 5),
  createProduct
)

router.put(
  '/:id',
  protect,
  requireRole('admin'),
  upload.array('images', 5),
  updateProduct
)

router.delete(
  '/:id',
  protect,
  requireRole('admin'),
  deleteProduct
)

module.exports = router
