const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const userController = require("../controllers/user");

// GET request to get ALL users
router.get("/all", userController.get_all_users);

// SIGNUP Route
router.post("/signup", userController.user_signup);

// SIGNIN Route
router.post("/login", userController.user_login);

// GET request to get a user by ID
router.get("/:id", userController.get_user_by_id);

// PATCH request to update a user by ID
router.patch("/:id", checkAuth, userController.update_user);

// DELETE request to delete a user by ID
router.delete("/:userId", checkAuth, userController.delete_user);

module.exports = router;
