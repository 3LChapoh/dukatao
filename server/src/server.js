require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const productRoutes = require('./routes/productRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const userRoutes = require('./routes/userRoutes')
const orderRoutes = require('./routes/orderRoutes')
const configRoutes = require('./routes/configRoutes')
const statsRoutes = require('./routes/statsRoutes')

const app = express()

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set in .env')
  process.exit(1)
}

connectDB()

app.use(cors())
app.use(express.json())

app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/config', configRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'DukaTao API is running' })
})

// centralized error handler (catches multer errors, thrown errors, etc.)
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
)
