const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const restrictTo = require("../middleware/restrict-to");
const userController = require("../controllers/user");

// GET request to get ALL users
router.get("/all", userController.get_all_users);

// GET request to get a user by ID
router.get("/:id", userController.get_user_by_id);

// PATCH request to update a user by ID
router.patch("/update", checkAuth, userController.update_user);

// DELETE request to delete a user by ID
router.delete("/delete", checkAuth, userController.delete_user);
// router.delete("/:userId", userController.delete_user);

// Update Password Route
router.patch("/updatePassword", checkAuth, userController.update_password);

module.exports = router;
