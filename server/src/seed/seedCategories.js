// Run once to seed initial household categories (safe to re-run — existing
// categories with the same name are left untouched):
//   node src/seed/seedCategories.js
require('dotenv').config()
const mongoose = require('mongoose')
const connectDB = require('../config/db')
const Category = require('../models/Category')

const DEFAULTS = [
  { name: 'Kitchen', color: '#d29a39', description: 'Cookware, utensils and kitchen tools' },
  { name: 'Electronics', color: '#4d91c9', description: 'Home electronics and small appliances' },
  { name: 'Toys & Games', color: '#d65f87', description: "Toys, games and kids' activities" },
  { name: 'Cleaning', color: '#4da873', description: 'Cleaning supplies and equipment' },
  { name: 'Storage & Organization', color: '#9b72c7', description: 'Containers, shelving and organizers' },
  { name: 'Bathroom', color: '#5fb0c9', description: 'Bathroom accessories and essentials' },
  { name: 'Laundry', color: '#c9a45f', description: 'Laundry products and accessories' },
  { name: 'Home Décor', color: '#c9574d', description: 'Décor and finishing touches for the home' },
]

async function run() {
  await connectDB()

  for (let i = 0; i < DEFAULTS.length; i++) {
    const def = DEFAULTS[i]
    await Category.findOneAndUpdate(
      { name: def.name },
      { $setOnInsert: { ...def, sortOrder: i } },
      { upsert: true, new: true }
    )
  }

  console.log(`Seeded ${DEFAULTS.length} household categories (existing ones left untouched).`)
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
