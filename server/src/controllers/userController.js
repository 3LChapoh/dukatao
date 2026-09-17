const User = require('../models/User')
const generateToken = require('../utils/generateToken')

function toPublic(user) {
  return {
    _id: user._id,
    name: user.name,
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    role: user.role,
    isActive: user.isActive,
  }
}

// POST /api/users/register
// Customer registration only.
async function register(req, res) {
  try {
    const { name, email, password, phone, address } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await User.findOne({ email: normalizedEmail })

    if (existing) {
      return res.status(400).json({
        message: 'An account with that email already exists',
      })
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      address,
      role: 'customer',
    })

    const token = generateToken({
      id: user._id,
      role: user.role,
    })

    res.status(201).json({
      token,
      user: toPublic(user),
    })
  } catch (err) {
    res.status(400).json({
      message: 'Registration failed',
      error: err.message,
    })
  }
}

// POST /api/users/login
// Customer login.
async function login(req, res) {
  try {
    const { email, password } = req.body

    const user = await User.findOne({
      email: (email || '').toLowerCase().trim(),
    }).select('+password')

    if (
      !user ||
      user.role !== 'customer' ||
      !user.isActive ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        message: 'Invalid email or password',
      })
    }

    const token = generateToken({
      id: user._id,
      role: user.role,
    })

    res.json({
      token,
      user: toPublic(user),
    })
  } catch (err) {
    res.status(500).json({
      message: 'Login failed',
      error: err.message,
    })
  }
}

// POST /api/users/admin-login
// Single admin login.
// Username + password only.
async function adminLogin(req, res) {
  try {
    const username = (req.body.username || '').toLowerCase().trim()
    const password = req.body.password || ''

    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required',
      })
    }

    const user = await User.findOne({
      username,
      role: 'admin',
    }).select('+password')

    if (
      !user ||
      !user.isActive ||
      !(await user.matchPassword(password))
    ) {
      return res.status(401).json({
        message: 'Invalid username or password',
      })
    }

    const token = generateToken({
      id: user._id,
      role: 'admin',
    })

    res.json({
      token,
      user: toPublic(user),
    })
  } catch (err) {
    res.status(500).json({
      message: 'Login failed',
      error: err.message,
    })
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
    res.status(400).json({
      message: 'Update failed',
      error: err.message,
    })
  }
}

// PUT /api/users/change-password
// Admin/customer can change their own password.
// Requires the current password.
async function changePassword(req, res) {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message:
          'Current password, new password and confirmation are required',
      })
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'New passwords do not match',
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'New password must be at least 6 characters',
      })
    }

    const user = await User.findById(req.auth.id).select('+password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const passwordMatches = await user.matchPassword(currentPassword)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Current password is incorrect',
      })
    }

    user.password = newPassword

    await user.save()

    res.json({
      message: 'Password updated successfully',
    })
  } catch (err) {
    res.status(500).json({
      message: 'Password update failed',
      error: err.message,
    })
  }
}

module.exports = {
  register,
  login,
  adminLogin,
  getMe,
  updateMe,
  changePassword,
}
