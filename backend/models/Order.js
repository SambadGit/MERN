const mongoose = require('mongoose');

// Orders snapshot item names/prices so historical totals do not change when
// the catalog is edited later.
const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    }],
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending', index: true },
    statusHistory: [{ status: String, changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, changedAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
