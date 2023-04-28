const mongoose = require("mongoose");
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
    .select("name email _id userImage")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          return {
            name: doc.name,
            email: doc.email,
            userImage: doc.userImage,
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
};

// Get user by ID
exports.get_user_by_id = (req, res, next) => {
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
