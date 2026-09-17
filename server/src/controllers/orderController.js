const mongoose = require('mongoose')
const Order = require('../models/Order')
const Product = require('../models/Product')

const ORDER_STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled']

function validQuantity(value) {
  const quantity = Number(value)
  return Number.isInteger(quantity) && quantity >= 1
}

function calculateOverallStatus(vendorOrders) {
  if (!vendorOrders.length) return 'Pending'

  const statuses = vendorOrders.map((vendorOrder) => vendorOrder.status)

  if (statuses.every((status) => status === 'Cancelled')) {
    return 'Cancelled'
  }

  if (statuses.every((status) => status === 'Completed')) {
    return 'Completed'
  }

  if (statuses.some((status) => status === 'Processing' || status === 'Completed')) {
    return 'Processing'
  }

  return 'Pending'
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

      const vendorMap = new Map()
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

        if (!vendorMap.has(product.vendor)) {
          vendorMap.set(product.vendor, {
            vendor: product.vendor,
            items: [],
            subtotal: 0,
          })
        }

        const vendorOrder = vendorMap.get(product.vendor)

        vendorOrder.items.push({
          product: product._id,
          name: product.name,
          vendor: product.vendor,
          price: product.price,
          qty: quantity,
        })

        vendorOrder.subtotal += itemTotal
      }

      const vendorOrders = Array.from(vendorMap.values()).map((vendorOrder) => ({
        ...vendorOrder,
        status: 'Pending',
      }))

      if (!vendorOrders.length) {
        throw Object.assign(
          new Error('Order must contain at least one valid vendor order'),
          { status: 400 }
        )
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

            vendorOrders,

            total,
            status: 'Pending',
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

async function getVendorOrders(req, res) {
  try {
    const orders = await Order.find({
      'vendorOrders.vendor': req.vendor.boutiqueName,
    }).sort({ createdAt: -1 })

    const vendorName = req.vendor.boutiqueName

    const vendorOrders = orders.map((order) => {
      const vendorOrder = order.vendorOrders.find(
        (entry) => entry.vendor === vendorName
      )

      if (!vendorOrder) return null

      return {
        orderId: order._id,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        deliveryLocation: order.deliveryLocation,

        paymentMethod: order.paymentMethod,

        vendor: vendorOrder.vendor,
        items: vendorOrder.items,
        subtotal: vendorOrder.subtotal,
        status: vendorOrder.status,

        overallStatus: order.status,
      }
    }).filter(Boolean)

    res.json(vendorOrders)
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch vendor orders',
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

    if (req.auth.role === 'vendor') {
      const vendorName = req.vendor.boutiqueName

      const vendorOrder = order.vendorOrders.find(
        (entry) => entry.vendor === vendorName
      )

      if (!vendorOrder) {
        return res.status(403).json({
          message: 'This order does not belong to your boutique',
        })
      }

      if (vendorOrder.status === 'Cancelled') {
        return res.status(400).json({
          message: 'Cancelled vendor orders cannot be changed',
        })
      }

      if (vendorOrder.status === 'Completed' && status !== 'Completed') {
        return res.status(400).json({
          message: 'Completed vendor orders cannot be moved backwards',
        })
      }

      if (status === 'Cancelled' && vendorOrder.status !== 'Cancelled') {
        await restockVendorOrder(vendorOrder)
      }

      vendorOrder.status = status

      order.status = calculateOverallStatus(order.vendorOrders)

      await order.save()

      return res.json({
        message: 'Vendor order updated',
        orderId: order._id,
        vendor: vendorOrder.vendor,
        status: vendorOrder.status,
        overallStatus: order.status,
      })
    }

    // Admin can update the overall order.
    // If admin cancels the order, restock every vendor's items.
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await restockOrder(order)
    }

    order.status = status

    if (status === 'Cancelled') {
      order.vendorOrders.forEach((vendorOrder) => {
        if (vendorOrder.status !== 'Cancelled') {
          vendorOrder.status = 'Cancelled'
        }
      })
    }

    if (status === 'Completed') {
      order.vendorOrders.forEach((vendorOrder) => {
        if (vendorOrder.status !== 'Cancelled') {
          vendorOrder.status = 'Completed'
        }
      })
    }

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

      order.vendorOrders.forEach((vendorOrder) => {
        vendorOrder.status = 'Cancelled'
      })

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

async function restockOrder(order, session = null) {
  for (const vendorOrder of order.vendorOrders) {
    await restockVendorOrder(vendorOrder, session)
  }
}

async function restockVendorOrder(vendorOrder, session = null) {
  for (const item of vendorOrder.items) {
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
  getVendorOrders,
  getAllOrders,
  updateStatus,
  cancelMyOrder,
}
