const express = require('express');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate } = require('../middleware/auth');
const schemas = require('../schemas/apiSchemas');
const controller = require('../controllers/authController');

// Authentication routes are public except for /me, which needs an access token.
const router = express.Router();
// Login has a stricter limit to slow down brute-force attempts.
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
router.post('/register', validate(schemas.register), asyncHandler(controller.register));
router.post('/login', loginLimit, validate(schemas.credentials), asyncHandler(controller.login));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', asyncHandler(controller.logout));
router.get('/me', authenticate, asyncHandler(controller.me));
module.exports = router;
