const cloudinary = require('../config/cloudinary')
const Product = require('../models/Product')
const Category = require('../models/Category')

function deleteImageFiles(images = []) {
  images.forEach(({ publicId }) => {
    if (!publicId) return
    cloudinary.uploader.destroy(publicId).catch((err) => {
      console.error('Failed to delete Cloudinary image:', publicId, err.message)
    })
  })
}

function filesToImages(files = []) {
  return files.map((f) => ({ url: f.path, publicId: f.filename }))
}

// GET /api/products
async function getProducts(req, res) {
  try {
    const { category, search, sort } = req.query

    const filter = {}
    if (category) filter.category = category
    if (search) filter.name = { $regex: search, $options: 'i' }

    let query = Product.find(filter).populate('category', 'name slug color')

    if (sort === 'low') query = query.sort({ price: 1 })
    else if (sort === 'high') query = query.sort({ price: -1 })
    else if (sort === 'name') query = query.sort({ name: 1 })
    else query = query.sort({ createdAt: -1 })

    const products = await query
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message })
  }
}

// GET /api/products/:id
async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug color')
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message })
  }
}

// POST /api/products  (admin only)
async function createProduct(req, res) {
  try {
    const { name, price, category, description, stock } = req.body

    const categoryDoc = await Category.findById(category)
    if (!categoryDoc) {
      if (req.files?.length) deleteImageFiles(filesToImages(req.files))
      return res.status(400).json({ message: 'Selected category does not exist' })
    }

    const images = filesToImages(req.files)

    const product = await Product.create({
      name,
      price,
      category,
      description,
      stock,
      images,
    })

    await product.populate('category', 'name slug color')

    res.status(201).json(product)
  } catch (err) {
    // clean up any uploaded images if creation failed
    if (req.files?.length) deleteImageFiles(filesToImages(req.files))
    res.status(400).json({ message: 'Failed to create product', error: err.message })
  }
}

// PUT /api/products/:id  (admin only)
async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const { name, price, category, description, stock, replaceImages } = req.body

    if (name !== undefined) product.name = name
    if (price !== undefined) product.price = price
    if (category !== undefined) {
      const categoryDoc = await Category.findById(category)
      if (!categoryDoc) {
        if (req.files?.length) deleteImageFiles(filesToImages(req.files))
        return res.status(400).json({ message: 'Selected category does not exist' })
      }
      product.category = category
    }
    if (description !== undefined) product.description = description
    if (stock !== undefined) product.stock = stock

    if (req.files?.length) {
      const newImages = filesToImages(req.files)

      if (replaceImages === 'true') {
        // swap entirely: delete old assets, use only new ones
        deleteImageFiles(product.images)
        product.images = newImages
      } else {
        // append to existing images
        product.images = [...product.images, ...newImages]
      }
    }

    await product.save()
    await product.populate('category', 'name slug color')
    res.json(product)
  } catch (err) {
    if (req.files?.length) deleteImageFiles(filesToImages(req.files))
    res.status(400).json({ message: 'Failed to update product', error: err.message })
  }
}

// DELETE /api/products/:id  (admin only)
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    deleteImageFiles(product.images)
    await product.deleteOne()

    res.json({ message: 'Product deleted', id: req.params.id })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message })
  }
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
}
