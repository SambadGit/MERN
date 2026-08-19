const mongoose = require('mongoose');

// This schema defines the shape and validation rules for every product document.
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 10,
      min: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Product is the database interface used by the API routes in server.js.
module.exports = mongoose.model('Product', productSchema);
