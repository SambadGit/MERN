const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { AppError } = require('../middleware/error');
const { createAccessToken, createRefreshToken, hashToken, refreshExpiry, verifyRefreshToken } = require('../utils/tokens');

// Issue a short-lived access token and a long-lived refresh token for a user.
const issueSession = async (user) => {
  const refreshToken = createRefreshToken();
  await RefreshToken.create({ user: user._id, tokenHash: hashToken(refreshToken), expiresAt: refreshExpiry() });
  return { accessToken: createAccessToken(user), refreshToken };
};

// Registration owns account uniqueness and password hashing.
const register = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('An account with this email already exists.', 409, 'EMAIL_IN_USE');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash });
  return { user, session: await issueSession(user) };
};

// Login reads the protected passwordHash field only for comparison.
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+passwordHash');
  const valid = user && user.isActive && await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  user.lastLoginAt = new Date();
  await user.save();
  return { user, session: await issueSession(user) };
};

// Rotation revokes the old refresh token before issuing a replacement.
const rotate = async (token) => {
  try {
    const record = await RefreshToken.findOne({ tokenHash: hashToken(token), revokedAt: null }).populate('user');
    if (!record || record.expiresAt < new Date() || !record.user.isActive) throw new Error('invalid');
    record.revokedAt = new Date();
    await record.save();
    return { user: record.user, session: await issueSession(record.user) };
  } catch (_error) {
    throw new AppError('Refresh token is invalid or expired.', 401, 'INVALID_REFRESH_TOKEN');
  }
};

const revoke = async (token) => { await RefreshToken.updateOne({ tokenHash: hashToken(token), revokedAt: null }, { revokedAt: new Date() }); };
const getUser = async (id) => User.findById(id);

module.exports = { register, login, rotate, revoke, getUser };
