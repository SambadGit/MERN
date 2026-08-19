// Validate body, query, and URL parameters before a controller runs.
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    const message = result.error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; ');
    return next(new (require('./error').AppError)(message, 400, 'VALIDATION_ERROR'));
  }
  req.validated = result.data;
  next();
};

module.exports = validate;
