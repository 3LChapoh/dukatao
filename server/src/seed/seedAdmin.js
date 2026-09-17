// Create or reset the single DukaTao admin account.
//
// Required:
//   ADMIN_USERNAME
//   ADMIN_PASSWORD
//
// Optional:
//   ADMIN_NAME
//
// Example:
//   ADMIN_USERNAME=shopadmin ADMIN_PASSWORD=changeme ADMIN_NAME="DukaTao Admin" node src/seed/seedAdmin.js

require('dotenv').config()

const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

async function run() {
  const {
    ADMIN_USERNAME,
    ADMIN_PASSWORD,
    ADMIN_NAME,
  } = process.env

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error(
      'Set ADMIN_USERNAME and ADMIN_PASSWORD before running this script.'
    )
    process.exit(1)
  }

  if (ADMIN_PASSWORD.length < 6) {
    console.error('ADMIN_PASSWORD must be at least 6 characters.')
    process.exit(1)
  }

  await connectDB()

  const username = ADMIN_USERNAME.toLowerCase().trim()

  // There must only ever be one admin.
  let admin = await User.findOne({ role: 'admin' }).select('+password')

  if (admin) {
    admin.username = username
    admin.password = ADMIN_PASSWORD
    admin.role = 'admin'
    admin.isActive = true

    if (ADMIN_NAME) {
      admin.name = ADMIN_NAME
    }

    await admin.save()

    console.log(`Updated existing admin account: ${username}`)
  } else {
    // Make sure the username isn't already being used
    // by another user.
    const existingUsername = await User.findOne({ username })

    if (existingUsername) {
      console.error(
        `Username "${username}" is already being used by another account.`
      )

      await mongoose.disconnect()
      process.exit(1)
    }

    admin = await User.create({
      name: ADMIN_NAME || 'DukaTao Admin',
      username,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    })

    console.log(`Created admin account: ${username}`)
  }

  // Safety check: there must only be one admin.
  const adminCount = await User.countDocuments({ role: 'admin' })

  if (adminCount > 1) {
    console.error(
      `WARNING: ${adminCount} admin accounts currently exist.`
    )
  }

  await mongoose.disconnect()
  process.exit(0)
}

run().catch(async (err) => {
  console.error('Seed failed:', err.message)

  try {
    await mongoose.disconnect()
  } catch (_) {}

  process.exit(1)
})
