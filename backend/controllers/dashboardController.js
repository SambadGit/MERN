const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const overview = async (_req, res) => {
  const [users, products, orders, revenue, recentOrders, recentUsers] = await Promise.all([
    User.countDocuments(), Product.countDocuments(), Order.countDocuments(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: null, value: { $sum: '$total' } } }]),
    Order.find().sort('-createdAt').limit(5).populate('customer', 'name email'),
    User.find().sort('-createdAt').limit(5).select('name email role createdAt'),
  ]);
  res.json({ success: true, data: { totals: { users, products, orders, revenue: revenue[0]?.value || 0 }, recentOrders, recentUsers } });
};
module.exports = { overview };
