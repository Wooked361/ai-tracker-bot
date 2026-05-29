export const errorHandler = (err, req, res, next) => {
  const logger = req.app.locals.logger;
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  logger.error({
    status,
    message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method
  });

  res.status(status).json({
    error: message,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  asyncHandler
};
