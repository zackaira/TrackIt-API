const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const authController = require("../controllers/auth");

// Signup Route
router.post("/signup", authController.user_signup);

// Login Route
router.post("/login", authController.user_login);

// Forgot Password Route
router.post("/forgotPassword", authController.forgot_password);

// Reset Password Route
router.patch("/resetPassword/:token", authController.reset_password);

// Get new token
// router.post("/token", checkAuth, authController.token);

module.exports = router;
