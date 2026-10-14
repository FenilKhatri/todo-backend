const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Valdiation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation Error";
  }

  // Mongodb duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = "Already exists";
  }

  // Mongoose invalid objectId / cast error
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }

  // Log server errors for debugging
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};

export default errorHandler;
