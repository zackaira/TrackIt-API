const jwt = require("jsonwebtoken");

// check if user is authorized to access a route
module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userData = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Auth failed",
    });
  }
};
