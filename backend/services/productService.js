const Product = require('../models/Product');
const { AppError } = require('../middleware/error');

// Product listing applies search/filter/pagination in MongoDB before returning data.
const list = async ({ page = 1, limit = 10, search, sort = '-createdAt', status, category }) => {
  const filter = {};
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
  if (status) filter.status = status;
  if (category) filter.category = category;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
};

const get = async (id) => {
  const product = await Product.findById(id);
  if (!product) throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return product;
};
const create = (data) => Product.create(data);
const update = async (id, data) => {
  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
  return product;
};
const remove = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError('Product not found.', 404, 'PRODUCT_NOT_FOUND');
};

module.exports = { list, get, create, update, remove };
