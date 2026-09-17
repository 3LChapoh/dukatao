const User = require('../models/User')
const generateToken = require('../utils/generateToken')

function toPublic(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
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
    const { email, password, securityKey } = req.body

    if (securityKey !== process.env.ADMIN_SECURITY_KEY) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const user = await User.findOne({ email: (email || '').toLowerCase().trim() }).select('+password')

    if (!user || user.role !== 'admin' || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken({ id: user._id, role: user.role })
    res.json({ token, user: toPublic(user) })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
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

module.exports = { register, login, adminLogin, getMe, updateMe }
