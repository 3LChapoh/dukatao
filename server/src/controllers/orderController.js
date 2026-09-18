const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

const ORDER_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled']

function validQuantity(value) {
  const quantity = Number(value)
  return Number.isInteger(quantity) && quantity >= 1
}

async function createOrder(req, res) {
  const session = await mongoose.startSession()

  try {
    let created

    await session.withTransaction(async () => {
      const {
        items,
        customerName,
        customerEmail,
        customerPhone,
        deliveryLocation,
        paymentMethod,
      } = req.body

      if (!Array.isArray(items) || items.length === 0) {
        throw Object.assign(
          new Error('Order must include at least one item'),
          { status: 400 }
        )
      }

      if (!customerName || !customerEmail || !deliveryLocation || !paymentMethod) {
        throw Object.assign(
          new Error(
            'Customer name, email, delivery location and payment method are required'
          ),
          { status: 400 }
        )
      }

      const orderItems = []
      let total = 0

      for (const item of items) {
        const { productId, qty } = item

        if (!mongoose.Types.ObjectId.isValid(productId)) {
          throw Object.assign(
            new Error(`Invalid product ID: ${productId}`),
            { status: 400 }
          )
        }

        if (!validQuantity(qty)) {
          throw Object.assign(
            new Error(`Invalid quantity for product ${productId}`),
            { status: 400 }
          )
        }

        const quantity = Number(qty)

        const product = await Product.findById(productId).session(session)

        if (!product) {
          throw Object.assign(
            new Error(`Product ${productId} not found`),
            { status: 404 }
          )
        }

        if (product.stock < quantity) {
          throw Object.assign(
            new Error(
              `Only ${product.stock} left in stock for "${product.name}"`
            ),
            { status: 409 }
          )
        }

        product.stock -= quantity
        await product.save({ session })

        const itemTotal = product.price * quantity
        total += itemTotal

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          qty: quantity,
        })
      }

      const [order] = await Order.create(
        [
          {
            customer:
              req.auth?.role === 'customer'
                ? req.auth.id
                : undefined,

            customerName,
            customerEmail,
            customerPhone: customerPhone || '',
            deliveryLocation,
            paymentMethod,

            items: orderItems,

            total,
            status: 'Pending',
            paymentStatus: 'Pending',
          },
        ],
        { session }
      )

      created = order
    })

    res.status(201).json(created)
  } catch (err) {
    res.status(err.status || 500).json({
      message: err.message || 'Failed to place order',
    })
  } finally {
    await session.endSession()
  }
}

async function getMyOrders(req, res) {
  try {
    const orders = await Order.find({
      customer: req.auth.id,
    }).sort({ createdAt: -1 })

    res.json(orders)
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: err.message,
    })
  }
}

async function getAllOrders(req, res) {
  try {
    const filter = {}

    if (req.query.status) {
      if (!ORDER_STATUSES.includes(req.query.status)) {
        return res.status(400).json({
          message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
        })
      }

      filter.status = req.query.status
    }

    const orders = await Order.find(filter).sort({
      createdAt: -1,
    })

    res.json(orders)
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: err.message,
    })
  }
}

async function updateStatus(req, res) {
  try {
    const { status } = req.body

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`,
      })
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: 'Invalid order ID',
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        message: 'Order not found',
      })
    }

    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await restockOrder(order)
    }

    order.status = status

    await order.save()

    res.json(order)
  } catch (err) {
    res.status(400).json({
      message: 'Failed to update order',
      error: err.message,
    })
  }
}

async function cancelMyOrder(req, res) {
  const session = await mongoose.startSession()

  try {
    let updatedOrder

    await session.withTransaction(async () => {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw Object.assign(
          new Error('Invalid order ID'),
          { status: 400 }
        )
      }

      const order = await Order.findOne({
        _id: req.params.id,
        customer: req.auth.id,
      }).session(session)

      if (!order) {
        throw Object.assign(
          new Error('Order not found'),
          { status: 404 }
        )
      }

      if (order.status === 'Cancelled') {
        throw Object.assign(
          new Error('Order is already cancelled'),
          { status: 400 }
        )
      }

      if (order.status === 'Completed') {
        throw Object.assign(
          new Error('Completed orders cannot be cancelled'),
          { status: 400 }
        )
      }

      await restockOrder(order, session)

      order.status = 'Cancelled'

      await order.save({ session })

      updatedOrder = order
    })

    res.json(updatedOrder)
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.message || 'Failed to cancel order',
    })
  } finally {
    await session.endSession()
  }
}

// GET /api/orders/track?orderId=...&email=...
// Public lookup for guest (and signed-in) customers who want to check status
// without logging in. Requires the last-7 order ID plus the exact email used
// at checkout, so it isn't a way to browse other people's orders.
async function trackOrder(req, res) {
  try {
    const { orderId, email } = req.query

    if (!orderId || !email) {
      return res.status(400).json({ message: 'Order ID and email are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const suffix = String(orderId).trim().toUpperCase()

    if (suffix.length < 4) {
      return res.status(400).json({ message: 'Enter more of the order ID' })
    }

    // Match on the last 7 characters customers actually see (order._id.slice(-7)),
    // scoped to their email so this can't be used to enumerate other orders.
    const candidates = await Order.find({ customerEmail: normalizedEmail }).sort({ createdAt: -1 })
    const order = candidates.find((o) => o._id.toString().slice(-7).toUpperCase() === suffix)

    if (!order) {
      return res.status(404).json({ message: 'No order found matching that ID and email' })
    }

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: 'Failed to look up order', error: err.message })
  }
}

async function restockOrder(order, session = null) {
  for (const item of order.items) {
    if (!mongoose.Types.ObjectId.isValid(item.product)) continue

    const query = Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.qty } },
      { new: true }
    )

    if (session) {
      query.session(session)
    }

    await query
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateStatus,
  cancelMyOrder,
  trackOrder,
}
