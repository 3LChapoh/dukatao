const express = require('express')
const router = express.Router()
const { protect, requireRole } = require('../middleware/auth')
const { getAdminStats } = require('../controllers/statsController')

router.get('/', protect, requireRole('admin'), getAdminStats)

module.exports = router
