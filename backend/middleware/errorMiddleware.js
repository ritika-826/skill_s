const errorMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = res.statusCode === 200
    ? 500
    : res.statusCode;

  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
};

module.exports = errorMiddleware;