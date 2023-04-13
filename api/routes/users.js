const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user");

// GET request to get ALL users
router.get("/", (req, res, next) => {
  User.find()
    .select("name email _id")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          return {
            name: doc.name,
            email: doc.email,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:3000/users/" + doc._id,
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

// POST request to add new users
router.post("/", (req, res, next) => {
  // Create a new user from Mongoose User model
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    email: req.body.email,
  });
  // Save the user to the database
  user
    .save()
    .then((result) => {
      console.log(result);
    })
    .catch((err) => console.log(err));

  res.status(200).json({
    message: "User created successfully",
    createdUser: {
      name: result.name,
      email: result.email,
      _id: result._id,
      request: {
        type: "GET",
        url: "http://localhost:3000/users/" + result._id,
      },
    },
  });
});

// GET request to get a user by ID
router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  User.findById(id)
    .select("name email _id")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          user: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/users",
          },
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for the provided ID" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

// PATCH request to update a user by ID
router.patch("/:id", (req, res, next) => {
  const id = req.params.id;
  const updateOps = {};

  // Loop through the request and only update the properties that changed
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }

  User.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User updated !",
        request: {
          type: "GET",
          url: "http://localhost:3000/users/" + id,
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

// DELETE request to delete a user by ID
router.delete("/:id", (req, res, next) => {
  const id = req.params.id;
  User.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted !",
        request: {
          type: "POST",
          url: "http://localhost:3000/users/" + id,
          data: {
            name: "String",
            email: "String",
          },
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
