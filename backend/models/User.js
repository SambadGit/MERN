const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'manager', 'user'], default: 'user', index: true },
    isActive: { type: Boolean, default: true, index: true },
    lastLoginAt: Date,
  },
  { timestamps: true, toJSON: { transform: (_doc, value) => { delete value.passwordHash; return value; } } }
);

module.exports = mongoose.model('User', userSchema);
