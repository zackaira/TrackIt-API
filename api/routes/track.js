const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/check-auth");
const trackController = require("../controllers/track");

// GET request to get ALL Tracks
router.get("/", trackController.get_all_tracks);

// GET request to get Tracks by ID
router.get("/:userId", trackController.get_track_by_id);

// POST request to add new Tracks
router.post("/", checkAuth, trackController.add_new_track);

// PATCH request to update a Track by ID
router.patch("/:userId", checkAuth, trackController.update_track);

module.exports = router;
