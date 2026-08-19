const express = require('express');
const validate = require('../middleware/validate');
const asyncHandler = require('../middleware/asyncHandler');
const { authenticate, authorize } = require('../middleware/auth');
const schemas = require('../schemas/apiSchemas');
const controller = require('../controllers/userController');

// User administration is deliberately restricted to administrators on the API.
const router = express.Router();
router.use(authenticate, authorize('admin'));
router.get('/', validate(schemas.userQuery), asyncHandler(controller.list));
router.post('/', validate(schemas.userCreate), asyncHandler(controller.create));
router.patch('/:id', validate(schemas.roleUpdate), asyncHandler(controller.updateRole));
module.exports = router;
