const Category = require('../models/Category')
const Product = require('../models/Product')

// GET /api/categories — public gets active categories only; an authenticated
// admin passing ?all=true also sees inactive ones (for the admin dashboard).
async function getCategories(req, res) {
  try {
    const includeInactive = req.query.all === 'true' && req.auth?.role === 'admin'
    const filter = includeInactive ? {} : { isActive: true }
    const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 })
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message })
  }
}

async function getCategoryById(req, res) {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })
    res.json(category)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch category', error: err.message })
  }
}

// POST /api/categories (admin)
async function createCategory(req, res) {
  try {
    const { name, description, color, sortOrder } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' })
    }

    const category = await Category.create({ name, description, color, sortOrder })
    res.status(201).json(category)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A category with that name already exists' })
    }
    res.status(400).json({ message: 'Failed to create category', error: err.message })
  }
}

// PUT /api/categories/:id (admin)
async function updateCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const { name, description, color, isActive, sortOrder } = req.body
    if (name !== undefined) category.name = name
    if (description !== undefined) category.description = description
    if (color !== undefined) category.color = color
    if (isActive !== undefined) category.isActive = isActive
    if (sortOrder !== undefined) category.sortOrder = sortOrder

    await category.save()
    res.json(category)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'A category with that name already exists' })
    }
    res.status(400).json({ message: 'Failed to update category', error: err.message })
  }
}

// DELETE /api/categories/:id (admin)
// Refuses to delete a category that still has products, so products never
// get silently orphaned — the admin must reassign or remove them first.
async function deleteCategory(req, res) {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) return res.status(404).json({ message: 'Category not found' })

    const productCount = await Product.countDocuments({ category: category._id })
    if (productCount > 0) {
      return res.status(409).json({
        message: `Cannot delete "${category.name}" — ${productCount} product(s) still use it. Reassign or delete them first.`,
        productCount,
      })
    }

    await category.deleteOne()
    res.json({ message: 'Category deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete category', error: err.message })
  }
}

// PUT /api/categories/reorder (admin)
// body: { orderedIds: [id1, id2, ...] } — sets sortOrder to each id's index.
async function reorderCategories(req, res) {
  try {
    const { orderedIds } = req.body
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ message: 'orderedIds must be a non-empty array' })
    }

    await Promise.all(
      orderedIds.map((id, index) => Category.findByIdAndUpdate(id, { sortOrder: index }))
    )

    const categories = await Category.find().sort({ sortOrder: 1, name: 1 })
    res.json(categories)
  } catch (err) {
    res.status(400).json({ message: 'Failed to reorder categories', error: err.message })
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
}
