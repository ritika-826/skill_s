const recruiterMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const role = req.user.role ? req.user.role.toLowerCase() : "";

  if (role !== "recruiter" && role !== "admin") {
    return res.status(403).json({
      message: "Recruiter access required",
    });
  }

  next();
};

module.exports = recruiterMiddleware;
