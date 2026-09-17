const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Vendor = require('../models/Vendor')

// Verifies the token and attaches { id, role } to req.auth.
// Does not look up the full record — controllers fetch what they need.
async function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = { id: decoded.id, role: decoded.role }
    next()
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, invalid token' })
  }
}

// Like protect, but doesn't fail when there's no/invalid token — used for
// guest-allowed routes (checkout) that still want to know if a customer is signed in.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return next()

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.auth = { id: decoded.id, role: decoded.role }
  } catch (err) {
    // ignore invalid/expired token on optional routes
  }
  next()
}

// Restricts a route to one or more roles, e.g. requireRole('admin')
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' })
    }
    next()
  }
}

// Loads the authenticated customer's User doc onto req.user (used by userController)
async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.auth.id)
    if (!user) return res.status(401).json({ message: 'User no longer exists' })
    req.user = user
    next()
  } catch (err) {
    res.status(500).json({ message: 'Failed to load user', error: err.message })
  }
}

// Loads the authenticated vendor's doc onto req.vendor (used by vendorController)
async function attachVendor(req, res, next) {
  try {
    const vendor = await Vendor.findById(req.auth.id)
    if (!vendor) return res.status(401).json({ message: 'Vendor no longer exists' })
    req.vendor = vendor
    next()
  } catch (err) {
    res.status(500).json({ message: 'Failed to load vendor', error: err.message })
  }
}

// Attaches req.vendor only when the caller is a vendor; no-op for admin.
// Use after requireRole('vendor', 'admin') on routes both roles can hit.
function attachVendorIfVendor(req, res, next) {
  if (req.auth.role === 'vendor') return attachVendor(req, res, next)
  next()
}

module.exports = { protect, optionalAuth, requireRole, attachUser, attachVendor, attachVendorIfVendor }
