const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { clientOrigin } = require('./config/env');
const { notFound, errorHandler } = require('./middleware/error');

// Create the Express application. server.js is responsible for connecting to
// MongoDB and starting the listener; this file only defines HTTP behavior.
const app = express();

// Baseline security and request parsing middleware used by every API route.
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// Health checks are intentionally public so a process monitor can test the API.
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'mern-admin-api' }));

// Versioned route groups keep the public API stable as features evolve.
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/users', require('./routes/userRoutes'));
app.use('/api/v1/products', require('./routes/productRoutes'));
app.use('/api/v1/orders', require('./routes/orderRoutes'));
app.use('/api/v1/dashboard', require('./routes/dashboardRoutes'));

// Error middleware must be registered after all routes so it can handle any
// rejected request that reaches the end of the pipeline.
app.use(notFound);
app.use(errorHandler);
module.exports = app;
