const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
// Set Options for file uploads
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
const User = require("../models/user");

// Get All Users - MOVE this to another controller later
exports.get_all_users = (req, res, next) => {
  User.find()
    .select("_id email userImage role dateCreated")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          return {
            _id: doc._id,
            email: doc.email,
            userImage: doc.userImage || "",
            role: doc.role,
            dateCreated: doc.dateCreated || "",
            request: {
              type: "GET",
              url: `${process.env.API_URL}/users/${doc._id}`,
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
};

// Get user by ID
exports.get_user_by_id = (req, res, next) => {
  const id = req.params.id;

  User.findById(id)
    .select("name email _id userImage")
    .exec()
    .then((doc) => {
      if (doc) {
        res.status(200).json({
          user: doc,
          request: {
            type: "GET",
            url: `${process.env.API_URL}/user/${doc._id}`,
          },
        });
      } else {
        res.status(404).json({ message: "This user does not exist" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};

// Update the user by ID
exports.update_user = (req, res, next) => {
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
          url: `${process.env.API_URL}/user/${id}`,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
};

// Delete a user - Admin only - Might remove this or make the user inactive instead
exports.delete_user = (req, res, next) => {
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
};

exports.update_password = (req, res, next) => {
  const userId = req.params.userId;
  // Get user from collection
  User.findById(userId)
    .select("+password")
    .exec()
    .then((user) => {
      if (user) {
        bcrypt.compare(
          req.body.currentPassword,
          user.password,
          (err, result) => {
            if (err) {
              return res.status(401).json({
                message: "Incorrect Current Password!",
              });
            }

            if (result) {
              bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
                if (err) {
                  return res.status(500).json({
                    error: err,
                  });
                } else {
                  user.password = hash;

                  const tokenPayload = {
                    userId: user._id,
                    email: user.email,
                    role: user.role,
                  };

                  const accessToken = jwt.sign(
                    tokenPayload,
                    process.env.ACCESS_TOKEN_SECRET,
                    {
                      expiresIn: "14m", // 14m
                    }
                  );

                  user
                    .save()
                    .then((result) => {
                      res.status(201).json({
                        _id: user._id,
                        email: user.email,
                        token: {
                          accessToken: accessToken,
                        },
                        role: user.role,
                        dateCreated: user.dateCreated,
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
            } else {
              return res.status(401).json({
                message: "Incorrect Current Password!",
              });
            }
          }
        );
      } else {
        res.status(404).json({ message: "User Not Found!" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ message: "User Not Found!" });
    });
};
