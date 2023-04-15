const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Track = require("../models/track");
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");

// GET request to get ALL Tracks
router.get("/", (req, res, next) => {
  Track.find()
    .select("userId trackArray _id")
    .populate("userId", "name email") // Adds User details into the Track response
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        tracks: docs.map((doc) => {
          return {
            user: doc.userId,
            trackArray: doc.trackArray,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/tracks/" + doc._id,
            },
          };
        }),
      };

      // if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //     res.status(404).json({
      //       message: "No entries found",
      //     });
      //   }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// GET request to get Tracks by ID
router.get("/:userId", (req, res, next) => {
  const userId = req.params.userId;

  Track.find({ userId: userId })
    .select("userId trackArray _id")
    .exec()
    .then((doc) => {
      if (!doc.length) {
        return res.status(404).json({
          message: "No Track was found for that user",
        });
      }

      if (doc) {
        res.status(200).json({
          tracks: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/tracks",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for that track ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// POST request to add new Tracks
router.post("/", checkAuth, (req, res, next) => {
  User.findById(req.body.userId)
    .then((user) => {
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const track = new Track({
        _id: new mongoose.Types.ObjectId(),
        userId: req.body.userId,
        trackArray: req.body.trackArray,
      });

      return track.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Track added successfully",
        createdTrack: {
          userId: result.userId,
          trackArray: result.trackArray,
          _id: result._id,
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/tracks/" + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// PATCH request to update a Track by ID
router.patch("/:userId", checkAuth, (req, res, next) => {
  const userId = req.params.userId;

  const updateOps = {};

  // Loop through the request and only update the properties that changed
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  Track.updateMany({ userId: userId }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Track updated for the user!",
        request: {
          type: "GET",
          url: "http://localhost:3000/tracks/" + userId,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;
