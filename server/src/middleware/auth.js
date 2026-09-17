const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Verifies the JWT and attaches { id, role } to req.auth.
async function protect(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : null

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token',
    })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.auth = {
      id: decoded.id,
      role: decoded.role,
    }

    next()
  } catch (err) {
    res.status(401).json({
      message: 'Not authorized, invalid token',
    })
  }
}

// Allows guest access while attaching customer auth when
// a valid customer token is provided.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : null

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    req.auth = {
      id: decoded.id,
      role: decoded.role,
    }
  } catch (err) {
    // Ignore invalid/expired tokens on optional routes.
  }

  next()
}

// Restricts a route to one or more roles.
function requireRole(...roles) {
  return (req, res, next) => {
    if (
      !req.auth ||
      !roles.includes(req.auth.role)
    ) {
      return res.status(403).json({
        message: 'Forbidden: insufficient permissions',
      })
    }

    next()
  }
}

// Loads the authenticated User document.
async function attachUser(req, res, next) {
  try {
    const user = await User.findById(req.auth.id)

    if (!user) {
      return res.status(401).json({
        message: 'User no longer exists',
      })
    }

    req.user = user
    next()
  } catch (err) {
    res.status(500).json({
      message: 'Failed to load user',
      error: err.message,
    })
  }
}

module.exports = {
  protect,
  optionalAuth,
  requireRole,
  attachUser,
}
