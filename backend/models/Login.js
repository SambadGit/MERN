const mongoose = require('mongoose');

const loginSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
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

module.exports = mongoose.model('Login', loginSchema, 'login');
