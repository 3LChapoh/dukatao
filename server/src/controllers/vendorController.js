const Vendor = require('../models/Vendor')
const generateToken = require('../utils/generateToken')

function toPublic(vendor) {
  return {
    _id: vendor._id,
    boutiqueName: vendor.boutiqueName,
    contactName: vendor.contactName,
    email: vendor.email,
    phone: vendor.phone,
    description: vendor.description,
  }
}

// POST /api/vendors/login
// Single-vendor store: this is the one boutique account, created via
// server/src/seed/seedVendor.js. There is no signup/apply/approve flow.
async function login(req, res) {
  try {
    const { email, password } = req.body
    const vendor = await Vendor.findOne({ email: (email || '').toLowerCase().trim() }).select('+password')

    if (!vendor || !vendor.password || !(await vendor.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken({ id: vendor._id, role: 'vendor' })
    res.json({ token, vendor: toPublic(vendor) })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
}

// GET /api/vendors/me  (vendor)
async function getMe(req, res) {
  res.json(toPublic(req.vendor))
}

module.exports = { login, getMe }
