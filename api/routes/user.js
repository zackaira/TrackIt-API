const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const restrictTo = require("../middleware/restrict-to");
const userController = require("../controllers/user");

// GET request to get ALL users
router.get("/all", userController.get_all_users);

// GET request to get a user by ID
router.get("/:id", userController.get_user_by_id);

// PATCH request to update user by accessToken
router.patch("/update", checkAuth, userController.update_user);

// DELETE request to delete (deactivate) user by accessToken
router.delete("/delete", checkAuth, userController.delete_user);
// router.delete("/:userId", userController.delete_user);

// PATCH request to update user password
router.patch("/updatePassword", checkAuth, userController.update_password);

module.exports = router;
