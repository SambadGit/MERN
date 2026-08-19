const dotenv = require('dotenv');

dotenv.config();

// Read an environment value and fail early when an essential setting is absent.
const getRequired = (name, fallback) => {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
};

// Keep configuration in one object so the rest of the backend never reads
// process.env directly or duplicates default values.
module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: getRequired('MONGO_URI', 'mongodb://127.0.0.1:27017/mern_demo'),
  jwtAccessSecret: getRequired('JWT_ACCESS_SECRET', 'development-access-secret-change-me'),
  jwtRefreshSecret: getRequired('JWT_REFRESH_SECRET', 'development-refresh-secret-change-me'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtlDays: Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
