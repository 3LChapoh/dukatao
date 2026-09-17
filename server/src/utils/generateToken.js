const jwt = require('jsonwebtoken')

// payload: { id, role } where role is 'customer' | 'vendor' | 'admin'
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
}

module.exports = generateToken
