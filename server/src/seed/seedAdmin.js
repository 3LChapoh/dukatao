// Run once (locally or as a one-off Render job) to create or reset the FIRST admin account:
//   ADMIN_USERNAME=shopadmin ADMIN_PASSWORD=changeme ADMIN_NAME="Boneye" node src/seed/seedAdmin.js
// Requires MONGO_URI to be set (loaded via dotenv from .env if present).
// Note: this bypasses the 2-admin cap and recovery-code flow used by the
// in-app admin signup — it's a break-glass tool for the terminal only.
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const User = require('../models/User')

async function run() {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_NAME } = process.env

  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    console.error('Set ADMIN_USERNAME and ADMIN_PASSWORD env vars before running this script.')
    process.exit(1)
  }

  await connectDB()

  const username = ADMIN_USERNAME.toLowerCase().trim()
  let admin = await User.findOne({ username }).select('+password')

  if (admin) {
    admin.password = ADMIN_PASSWORD
    admin.role = 'admin'
    if (ADMIN_NAME) admin.name = ADMIN_NAME
    await admin.save()
    console.log(`Updated existing admin account: ${username}`)
  } else {
    admin = await User.create({
      name: ADMIN_NAME || 'Admin',
      username,
      password: ADMIN_PASSWORD,
      role: 'admin',
    })
    console.log(`Created admin account: ${username}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
