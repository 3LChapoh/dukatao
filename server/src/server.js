require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const orderRoutes = require('./routes/orderRoutes')
const configRoutes = require('./routes/configRoutes')

const app = express()

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env')
  process.exit(1)
}

connectDB()

app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/config', configRoutes)

app.get('/', (req, res) => {
  res.json({ message: "Dukatao API is running" })
})

// centralized error handler (catches multer errors, thrown errors, etc.)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
