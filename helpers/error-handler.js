function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Unathorized access" });
  }
  if (err.name === "ValidationError") {
    return res.status(401).json({ message: err });
  }
  res.status(500).send(err);
}

module.exports = errorHandler;
