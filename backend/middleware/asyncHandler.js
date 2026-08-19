// Express 4 does not automatically forward rejected async handlers to error middleware.
// This wrapper keeps rejected controller promises inside the normal error pipeline.
const asyncHandler = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

module.exports = asyncHandler;
