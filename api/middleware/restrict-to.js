// Restrict access to certain user roles
module.exports = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userData.role)) {
      return res.status(403).json({
        message: "You do not have the correct permissions to access this route",
      });
    }
    next();
  };
};
