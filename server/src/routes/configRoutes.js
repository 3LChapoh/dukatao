const express = require('express')
const router = express.Router()
const { protect, requireRole } = require('../middleware/auth')
const { uploadHero } = require('../middleware/upload')
const { getConfig, updateHeroImages } = require('../controllers/settingsController')

router.get('/', getConfig)
router.put('/hero-images', protect, requireRole('admin'), uploadHero.array('images', 5), updateHeroImages)

module.exports = router
