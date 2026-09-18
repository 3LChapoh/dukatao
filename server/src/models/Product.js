const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price (KES) is required'],
      min: 0,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    images: {
      // Cloudinary-hosted images: url is what the client displays,
      // publicId is what we need to delete the asset from Cloudinary later.
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      default: [],
      _id: false,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
