const cloudinary = require('../config/cloudinary')
const Product = require('../models/Product')

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
    const { category, vendor, search, sort } = req.query

    const filter = {}
    if (category) filter.category = category
    if (vendor) filter.vendor = vendor
    if (search) filter.name = { $regex: search, $options: 'i' }

    let query = Product.find(filter)

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
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json(product)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product', error: err.message })
  }
}

// GET /api/products/mine  (vendor) — this boutique's own products
async function getMyProducts(req, res) {
  try {
    const products = await Product.find({ vendor: req.vendor.boutiqueName }).sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message })
  }
}

// POST /api/products  (vendor or admin)
// Vendors always publish under their own boutique name, regardless of what's in the body.
async function createProduct(req, res) {
  try {
    const { name, price, category, description, stock } = req.body
    const vendor = req.auth.role === 'vendor' ? req.vendor.boutiqueName : req.body.vendor

    if (!vendor) {
      return res.status(400).json({ message: 'Vendor / boutique name is required' })
    }

    const images = filesToImages(req.files)

    const product = await Product.create({
      name,
      vendor,
      price,
      category,
      description,
      stock,
      images,
    })

    res.status(201).json(product)
  } catch (err) {
    // clean up any uploaded images if creation failed
    if (req.files?.length) deleteImageFiles(filesToImages(req.files))
    res.status(400).json({ message: 'Failed to create product', error: err.message })
  }
}

// PUT /api/products/:id  (vendor: own products only; admin: any product)
async function updateProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    if (req.auth.role === 'vendor' && product.vendor !== req.vendor.boutiqueName) {
      return res.status(403).json({ message: 'This product does not belong to your boutique' })
    }

    const { name, vendor, price, category, description, stock, replaceImages } = req.body

    if (name !== undefined) product.name = name
    // vendors can't reassign a product to a different boutique; only admin can
    if (vendor !== undefined && req.auth.role === 'admin') product.vendor = vendor
    if (price !== undefined) product.price = price
    if (category !== undefined) product.category = category
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
    res.json(product)
  } catch (err) {
    if (req.files?.length) deleteImageFiles(filesToImages(req.files))
    res.status(400).json({ message: 'Failed to update product', error: err.message })
  }
}

// DELETE /api/products/:id  (vendor: own products only; admin: any product)
async function deleteProduct(req, res) {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    if (req.auth.role === 'vendor' && product.vendor !== req.vendor.boutiqueName) {
      return res.status(403).json({ message: 'This product does not belong to your boutique' })
    }

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
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
}
