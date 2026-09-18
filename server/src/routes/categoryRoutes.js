const express = require('express')
const router = express.Router()
const { protect, optionalAuth, requireRole } = require('../middleware/auth')
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} = require('../controllers/categoryController')

// optionalAuth so a signed-in admin can pass ?all=true and see inactive categories
router.get('/', optionalAuth, getCategories)

// must come before '/:id' or Express treats 'reorder' as an id
router.put('/reorder', protect, requireRole('admin'), reorderCategories)

router.get('/:id', getCategoryById)
router.post('/', protect, requireRole('admin'), createCategory)
router.put('/:id', protect, requireRole('admin'), updateCategory)
router.delete('/:id', protect, requireRole('admin'), deleteCategory)

module.exports = router
