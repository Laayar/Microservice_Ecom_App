const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || res.statusCode || 500;

  if (statusCode === 200) {
    statusCode = 500;
  }

  let message = err.message || "Internal Server Error";

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found. Invalid ID: ${err.value}`;
  }

  // Duplicate key (Mongo duplicate key error code is 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((error) => error.message)
      .join(", ");
  }

  // JWT invalid
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  // JWT expired
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Server log
  console.log("=============== ERROR ===============");
  console.error(`${req.method} ${req.originalUrl}`);
  console.error(err);
  console.error("===================================");

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

export default errorMiddleware;
