const Order = require('../models/Order');
const Product = require('../models/Product');
const { AppError } = require('../middleware/error');

const list = async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.validated.query;
  const filter = req.user.role === 'user' ? { customer: req.user.sub } : {};
  if (status) filter.status = status;
  const [items, total] = await Promise.all([Order.find(filter).populate('customer', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(limit), Order.countDocuments(filter)]);
  res.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
};
const create = async (req, res) => {
  const items = await Promise.all(req.validated.body.items.map(async ({ productId, quantity }) => {
    const product = await Product.findOneAndUpdate({ _id: productId, stock: { $gte: quantity } }, { $inc: { stock: -quantity, soldCount: quantity } }, { new: true });
    if (!product) throw new AppError('Product not found or insufficient stock.', 400, 'INSUFFICIENT_STOCK');
    return { product: product._id, name: product.name, quantity, price: product.price };
  }));
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.status(201).json({ success: true, data: await Order.create({ customer: req.user.sub, items, total, statusHistory: [{ status: 'Pending', changedBy: req.user.sub }] }) });
};
const updateStatus = async (req, res) => res.json({ success: true, data: await Order.findByIdAndUpdate(req.validated.params.id, { status: req.validated.body.status, $push: { statusHistory: { status: req.validated.body.status, changedBy: req.user.sub } } }, { new: true, runValidators: true }) });
module.exports = { list, create, updateStatus };
