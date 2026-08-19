const jwt = require('jsonwebtoken');
const { jwtAccessSecret } = require('../config/env');
const { AppError } = require('./error');

const authenticate = (req, _res, next) => {
  const header = req.get('authorization');
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Authentication is required.', 401, 'UNAUTHENTICATED'));
  try {
    req.user = jwt.verify(token, jwtAccessSecret);
    return next();
  } catch (_error) {
    return next(new AppError('Your session has expired. Please sign in again.', 401, 'TOKEN_EXPIRED'));
  }
};

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('You do not have permission for this action.', 403, 'FORBIDDEN'));
  next();
};

module.exports = { authenticate, authorize };
