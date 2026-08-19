const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const schemas = require('../schemas/apiSchemas');
const controller = require('../controllers/orderController');

// Orders are private business data and are always authenticated.
const router = express.Router();
router.use(authenticate);
// Users can create orders; only admin and manager roles can change status.
router.get('/', validate(schemas.orderQuery), asyncHandler(controller.list));
router.post('/', authorize('admin', 'manager', 'user'), validate(schemas.orderCreate), asyncHandler(controller.create));
router.patch('/:id/status', authorize('admin', 'manager'), validate(schemas.orderStatus), asyncHandler(controller.updateStatus));
module.exports = router;
