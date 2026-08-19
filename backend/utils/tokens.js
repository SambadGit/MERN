const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtAccessSecret, jwtRefreshSecret, accessTokenTtl, refreshTokenTtlDays } = require('../config/env');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createAccessToken = (user) => jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role, name: user.name }, jwtAccessSecret, { expiresIn: accessTokenTtl });
const createRefreshToken = () => crypto.randomBytes(48).toString('hex');
const refreshExpiry = () => new Date(Date.now() + refreshTokenTtlDays * 24 * 60 * 60 * 1000);
const verifyRefreshToken = (token) => jwt.verify(token, jwtRefreshSecret);

module.exports = { hashToken, createAccessToken, createRefreshToken, refreshExpiry, verifyRefreshToken, jwtRefreshSecret };
