const Settings = require('../models/Settings')
const cloudinary = require('../config/cloudinary')

async function getOrCreateSettings() {
  let settings = await Settings.findOne()
  if (!settings) {
    settings = await Settings.create({ heroImages: [] })
  }
  return settings
}

async function getConfig(req, res) {
  try {
    const settings = await getOrCreateSettings()
    res.json({
      whatsapp: process.env.RUBYS_CHOICE_WHATSAPP || '',
      email: process.env.RUBYS_CHOICE_EMAIL || '',
      heroImages: settings.heroImages,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load config', error: err.message })
  }
}

async function updateHeroImages(req, res) {
  try {
    const images = (req.files || []).map((f) => ({ url: f.path, publicId: f.filename }))
    if (images.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' })
    }

    const settings = await getOrCreateSettings()
    const oldImages = settings.heroImages

    settings.heroImages = images
    await settings.save()

    // Clean up the previous hero assets now that the new ones are saved.
    oldImages.forEach(({ publicId }) => {
      if (!publicId) return
      cloudinary.uploader.destroy(publicId).catch((err) => {
        console.error('Failed to delete old hero image:', publicId, err.message)
      })
    })

    res.json({ heroImages: settings.heroImages })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update hero images', error: err.message })
  }
}

module.exports = { getConfig, updateHeroImages }
