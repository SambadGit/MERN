const mongoose = require('mongoose');

// A schema describes the fields and validation rules for documents in MongoDB.
const loginSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    // Passwords are stored directly only because this is a learning demo.
    // Production applications should hash passwords before saving them.
    password: {
      type: String,
      required: true,
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    ipAddress: {
      type: String,
      default: 'local',
    },
  },
  { timestamps: true }
);

// The model provides methods such as create(), countDocuments(), and find().
module.exports = mongoose.model('Login', loginSchema, 'login');
