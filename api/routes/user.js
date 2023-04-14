const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"), false);
  }
};
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5mb
  fileFilter: fileFilter,
});
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// GET request to get ALL users
// router.get("/all", (req, res, next) => {
//   User.find()
//     .select("name email _id userImage")
//     .exec()
//     .then((docs) => {
//       const response = {
//         count: docs.length,
//         users: docs.map((doc) => {
//           return {
//             name: doc.name,
//             email: doc.email,
//             userImage: doc.userImage,
//             _id: doc._id,
//             request: {
//               type: "GET",
//               url: "http://localhost:3000/users/" + doc._id,
//             },
//           };
//         }),
//       };

//       // if (docs.length >= 0) {
//       res.status(200).json(response);
//       //   } else {
//       //     res.status(404).json({
//       //       message: "No entries found",
//       //     });
//       //   }
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// });

// SIGNUP Route
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Email already exists",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              name: req.body.name,
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          }
        });
      }
    });
});

// SIGNIN Route
router.post("/login", (req, res, next) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h",
            }
          );

          return res.status(200).json({
            message: "Auth successful",
            token: token,
          });
        }
        res.status(401).json({
          message: "Auth failed",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// GET request to get a user by ID
router.get("/:id", (req, res, next) => {
  const id = req.params.id;

  User.findById(id)
    .select("name email _id userImage")
    .exec()
    .then((doc) => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          user: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/user/" + doc._id,
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
          url: "http://localhost:3000/user/" + id,
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
router.delete("/:userId", (req, res, next) => {
  const userId = req.params.userId;
  User.deleteOne({ _id: userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
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
