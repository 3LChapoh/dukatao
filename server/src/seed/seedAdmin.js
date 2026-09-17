// Run once (locally or as a one-off Render job) to create or reset the admin account:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=changeme ADMIN_NAME="Boneye" node src/seed/seedAdmin.js
// Requires MONGO_URI to be set (loaded via dotenv from .env if present).
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

async function run() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars before running this script.')
    process.exit(1)
  }

  await connectDB()

  const email = ADMIN_EMAIL.toLowerCase().trim()
  let admin = await User.findOne({ email }).select('+password')

  if (admin) {
    admin.password = ADMIN_PASSWORD
    admin.role = 'admin'
    if (ADMIN_NAME) admin.name = ADMIN_NAME
    await admin.save()
    console.log(`Updated existing admin account: ${email}`)
  } else {
    admin = await User.create({
      name: ADMIN_NAME || 'Admin',
      email,
      password: ADMIN_PASSWORD,
      role: 'admin',
    })
    console.log(`Created admin account: ${email}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
