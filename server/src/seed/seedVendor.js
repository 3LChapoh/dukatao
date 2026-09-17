// Run once (locally or as a one-off Render job) to create or reset THE single
// boutique account (this is a single-vendor store — only ever one Vendor doc):
//   VENDOR_BOUTIQUE_NAME="Dukatao" VENDOR_CONTACT_NAME="Boneye" \
//   VENDOR_EMAIL=you@example.com VENDOR_PHONE="07XX XXX XXX" VENDOR_PASSWORD=changeme \
//   node src/seed/seedVendor.js
// Requires MONGO_URI to be set (loaded via dotenv from .env if present).
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Vendor = require('../models/Vendor')

async function run() {
  const {
    VENDOR_BOUTIQUE_NAME,
    VENDOR_CONTACT_NAME,
    VENDOR_EMAIL,
    VENDOR_PHONE,
    VENDOR_PASSWORD,
    VENDOR_DESCRIPTION,
  } = process.env

  if (!VENDOR_BOUTIQUE_NAME || !VENDOR_CONTACT_NAME || !VENDOR_EMAIL || !VENDOR_PHONE || !VENDOR_PASSWORD) {
    console.error(
      'Set VENDOR_BOUTIQUE_NAME, VENDOR_CONTACT_NAME, VENDOR_EMAIL, VENDOR_PHONE and VENDOR_PASSWORD env vars before running this script.'
    )
    process.exit(1)
  }

  await connectDB()

  const email = VENDOR_EMAIL.toLowerCase().trim()

  // Single-vendor store: there should only ever be one Vendor document.
  // If one already exists under a different email, update it in place
  // rather than creating a second boutique.
  let vendor = await Vendor.findOne({}).select('+password')

  if (vendor) {
    vendor.boutiqueName = VENDOR_BOUTIQUE_NAME
    vendor.contactName = VENDOR_CONTACT_NAME
    vendor.email = email
    vendor.phone = VENDOR_PHONE
    if (VENDOR_DESCRIPTION !== undefined) vendor.description = VENDOR_DESCRIPTION
    vendor.password = VENDOR_PASSWORD
    await vendor.save()
    console.log(`Updated existing boutique account: ${email}`)
  } else {
    vendor = await Vendor.create({
      boutiqueName: VENDOR_BOUTIQUE_NAME,
      contactName: VENDOR_CONTACT_NAME,
      email,
      phone: VENDOR_PHONE,
      description: VENDOR_DESCRIPTION || '',
      password: VENDOR_PASSWORD,
    })
    console.log(`Created boutique account: ${email}`)
  }

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
