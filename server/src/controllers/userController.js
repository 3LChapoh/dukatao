const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const User = require('../models/User')
const generateToken = require('../utils/generateToken')

const MAX_ADMINS = 2

// Human-writable one-time code, e.g. "A1B2-C3D4-E5F6-A7B8"
function generateRecoveryCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g).join('-')
}

function toPublic(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    username: user.username,
    phone: user.phone,
    address: user.address,
    role: user.role,
  }
}

// POST /api/users/register
async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' })
    }

    const user = await User.create({ name, email, password, phone, address })
    const token = generateToken({ id: user._id, role: user.role })

    res.status(201).json({ token, user: toPublic(user) })
  } catch (err) {
    res.status(400).json({ message: 'Registration failed', error: err.message })
  }
}

// POST /api/users/login
async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: (email || '').toLowerCase().trim() }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken({ id: user._id, role: user.role })
    res.json({ token, user: toPublic(user) })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
}

// POST /api/users/admin-login
async function adminLogin(req, res) {
  try {
    const { username, password } = req.body

    const user = await User.findOne({
      username: (username || '').toLowerCase().trim(),
      role: 'admin',
    }).select('+password')

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken({ id: user._id, role: user.role })
    res.json({ token, user: toPublic(user) })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
}

// POST /api/users/admin-signup
// Self-serve admin signup, capped at MAX_ADMINS accounts. Returns a one-time
// recovery code the admin must save immediately — it is never shown again
// and there is no email service to resend it.
async function adminSignup(req, res) {
  try {
    const { name, username, password } = req.body

    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Name, username and password are required' })
    }

    const adminCount = await User.countDocuments({ role: 'admin' })
    if (adminCount >= MAX_ADMINS) {
      return res.status(403).json({
        message: `Only ${MAX_ADMINS} admin accounts are allowed`,
      })
    }

    const normalizedUsername = username.toLowerCase().trim()
    const existing = await User.findOne({ username: normalizedUsername })
    if (existing) {
      return res.status(400).json({ message: 'That username is already taken' })
    }

    const recoveryCode = generateRecoveryCode()
    const recoveryCodeHash = await bcrypt.hash(recoveryCode, 10)

    const admin = await User.create({
      name,
      username: normalizedUsername,
      password,
      role: 'admin',
      recoveryCodeHash,
    })

    const token = generateToken({ id: admin._id, role: admin.role })

    res.status(201).json({
      token,
      user: toPublic(admin),
      recoveryCode,
    })
  } catch (err) {
    res.status(400).json({ message: 'Admin signup failed', error: err.message })
  }
}

// POST /api/users/admin-reset-password
// Verifies the one-time recovery code, sets a new password, and issues a
// fresh recovery code (the old one is now spent).
async function adminResetPassword(req, res) {
  try {
    const { username, recoveryCode, newPassword } = req.body

    if (!username || !recoveryCode || !newPassword) {
      return res.status(400).json({
        message: 'Username, recovery code and new password are required',
      })
    }

    const user = await User.findOne({
      username: username.toLowerCase().trim(),
      role: 'admin',
    }).select('+password +recoveryCodeHash')

    if (!user || !(await user.matchRecoveryCode(recoveryCode))) {
      return res.status(401).json({ message: 'Invalid username or recovery code' })
    }

    user.password = newPassword

    const newRecoveryCode = generateRecoveryCode()
    user.recoveryCodeHash = await bcrypt.hash(newRecoveryCode, 10)

    await user.save()

    res.json({
      message: 'Password reset — save your new recovery code, it will not be shown again',
      recoveryCode: newRecoveryCode,
    })
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message })
  }
}

// GET /api/users/me
async function getMe(req, res) {
  res.json(toPublic(req.user))
}

// PUT /api/users/me
async function updateMe(req, res) {
  try {
    const { name, phone, address } = req.body
    if (name !== undefined) req.user.name = name
    if (phone !== undefined) req.user.phone = phone
    if (address !== undefined) req.user.address = address

    await req.user.save()
    res.json(toPublic(req.user))
  } catch (err) {
    res.status(400).json({ message: 'Update failed', error: err.message })
  }
}

module.exports = { register, login, adminLogin, adminSignup, adminResetPassword, getMe, updateMe }
