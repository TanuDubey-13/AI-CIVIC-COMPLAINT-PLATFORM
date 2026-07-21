const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(stack && { stack }),
  });
};

module.exports = errorHandler;