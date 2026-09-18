const Order = require('../models/Order')
const Product = require('../models/Product')

const LOW_STOCK_THRESHOLD = 5

// GET /api/stats (admin only)
// Snapshot for the admin overview tab: order counts by status, revenue from
// completed orders, and which products need restocking.
async function getAdminStats(req, res) {
  try {
    const [statusCounts, revenueAgg, lowStockProducts, outOfStockCount, totalProducts] = await Promise.all([
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Product.find({ stock: { $gt: 0, $lte: LOW_STOCK_THRESHOLD } })
        .select('name stock')
        .sort({ stock: 1 })
        .limit(20),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments(),
    ])

    const ordersByStatus = { Pending: 0, Processing: 0, Completed: 0, Cancelled: 0 }
    statusCounts.forEach(({ _id, count }) => {
      if (_id in ordersByStatus) ordersByStatus[_id] = count
    })

    res.json({
      ordersByStatus,
      totalOrders: statusCounts.reduce((sum, s) => sum + s.count, 0),
      completedRevenue: revenueAgg[0]?.total || 0,
      totalProducts,
      outOfStockCount,
      lowStockProducts,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load stats', error: err.message })
  }
}

module.exports = { getAdminStats }
