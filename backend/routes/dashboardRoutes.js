const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const controller = require('../controllers/dashboardController');
const router = express.Router();
router.get('/', authenticate, authorize('admin', 'manager'), asyncHandler(controller.overview));
module.exports = router;
