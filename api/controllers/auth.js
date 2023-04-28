const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// User SIGNUP route
exports.user_signup = (req, res, next) => {
  console.log(req.body);

  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "User already exists",
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
              email: req.body.email,
              password: hash,
            });

            const accessToken = jwt.sign(
              {
                email: user.email,
                userId: user._id,
              },
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "1h", // 14m
              }
            );

            user
              .save()
              .then((result) => {
                console.log(result);
                res.status(201).json({
                  message: "User created",
                  accessToken: accessToken,
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
};

// User LOGIN route
exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        console.log(user);
        return res.status(401).json({
          message: "Auth failed",
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        if (result) {
          const accessToken = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1h", // 14m
            }
          );
          const refreshToken = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "30d", // 30d / 60d
            }
          );

          return res.status(200).json({
            message: "Auth successful",
            accessToken: accessToken,
            refreshToken: refreshToken,
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
};

// Route to get a new token when expired
exports.token = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) {
    return res.sendStatus(401).json({
      message: "Auth failed",
    });
  }
};
