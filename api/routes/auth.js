const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const authController = require("../controllers/auth");

// SIGNUP Route
router.post("/signup", authController.user_signup);

// SIGNIN Route
router.post("/login", authController.user_login);

// SIGNIN Route
router.post("/forgotPassword", authController.forgot_password);

// SIGNIN Route
router.patch("/resetPassword/:token", authController.reset_password);

// Get new token
// router.post("/token", checkAuth, authController.token);

module.exports = router;
