const express = require("express");
const router = express.Router();

// GET request to get all Tracks
router.get("/:id", (req, res, next) => {
  res.status(200).json({
    message: "displaying all tracks",
  });
});

// POST request to add new Tracks
router.post("/", (req, res, next) => {
  const track = {
    id: req.body.id,
    track: req.body.track,
  };

  res.status(200).json({
    message: "Handling POST requests to tracks",
    createdTrack: track,
  });
});

// PATCH request to update a Track by ID
router.patch("/:id", (req, res, next) => {
  const id = req.params.id;

  if (id === "special") {
    res.status(200).json({
      message: "You discovered the special ID",
      id: id,
    });
  } else {
    res.status(200).json({
      message: "You passed an ID",
    });
  }
});

module.exports = router;
