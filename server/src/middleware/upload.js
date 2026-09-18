const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dukatao/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 2000, crop: 'limit' }],
  },
})

const heroStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'dukatao/hero',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 1600, crop: 'limit' }],
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, PNG, or WEBP images are allowed'))
  }
}

const limits = { fileSize: 5 * 1024 * 1024 }

const upload = multer({ storage: productStorage, fileFilter, limits })
const uploadHero = multer({ storage: heroStorage, fileFilter, limits })

module.exports = upload
module.exports.uploadHero = uploadHero
