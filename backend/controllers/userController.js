const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { AppError } = require('../middleware/error');
// User responses use projections so passwords and other authentication fields
// never leave the backend.
const list = async (req, res) => {
  const { page = 1, limit = 10, search, role, isActive } = req.validated.query;
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive;
  const [items, total] = await Promise.all([User.find(filter).select('name email role isActive lastLoginAt createdAt').sort('-createdAt').skip((page - 1) * limit).limit(limit), User.countDocuments(filter)]);
  res.json({ success: true, data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
};
const updateRole = async (req, res) => res.json({ success: true, data: { user: await User.findByIdAndUpdate(req.validated.params.id, req.validated.body, { new: true, runValidators: true }).select('name email role isActive') } });
const create = async (req, res) => {
  const { name, email, password, role } = req.validated.body;
  if (await User.exists({ email })) throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  const user = await User.create({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
  res.status(201).json({ success: true, data: { user } });
};
module.exports = { list, create, updateRole };
