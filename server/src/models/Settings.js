const mongoose = require('mongoose')

// Singleton document — one row holds all site-wide settings.
const settingsSchema = new mongoose.Schema(
  {
    heroImages: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      default: [],
      _id: false,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Settings', settingsSchema)
