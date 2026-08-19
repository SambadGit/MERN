class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const notFound = (req, _res, next) => next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  const message = statusCode >= 500 ? 'An unexpected server error occurred.' : error.message;
  if (statusCode >= 500) console.error(error);
  res.status(statusCode).json({ success: false, error: { code: error.code || 'REQUEST_ERROR', message } });
};

module.exports = { AppError, notFound, errorHandler };
