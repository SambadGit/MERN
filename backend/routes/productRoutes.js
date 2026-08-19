const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const schemas = require('../schemas/apiSchemas');
const controller = require('../controllers/productController');

// Every product operation requires a valid access token.
const router = express.Router();
router.use(authenticate);
// Reading is available to all authenticated users; writes are role restricted.
router.get('/', validate(schemas.productQuery), asyncHandler(controller.list));
router.get('/:id', validate(schemas.id), asyncHandler(controller.get));
router.post('/', authorize('admin', 'manager'), validate(schemas.product), asyncHandler(controller.create));
router.put('/:id', authorize('admin', 'manager'), validate(schemas.product), asyncHandler(controller.update));
router.delete('/:id', authorize('admin'), validate(schemas.id), asyncHandler(controller.remove));
module.exports = router;
