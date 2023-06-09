const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Email = require("../util/email");

// User SIGNUP route
exports.user_signup = (req, res, next) => {
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

            const tokenPayload = {
              userId: user._id,
              email: user.email,
              role: user.role,
            };

            const accessToken = jwt.sign(
              tokenPayload,
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "1h", // 14m
              }
            );

            user
              .save()
              .then((result) => {
                // CHECK IF USER_SIGNUP NEEDS CATCHASYNC FUNCTION TO BE ABLE TO ADD AWAIT ONTO NEW EMAIL FUNCTION
                const testUser = {
                  firstName: "Zacariah",
                  email: "zack@kairaweb.com",
                  role: "user",
                };
                // const url = `${process.env.API_URL}/activate_account_url`;
                const url = `https://kairaweb.com/`;
                new Email(testUser, url).sendWelcome();

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
      }
    });
};

// User LOGIN route
exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
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
          const tokenPayload = {
            userId: user[0]._id,
            email: user[0].email,
            role: user[0].role,
          };

          const accessToken = jwt.sign(
            tokenPayload,
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "14m", // 14m
            }
          );
          const refreshToken = jwt.sign(
            tokenPayload,
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "30d", // 30d / 60d
            }
          );

          // Reactivate user account if deactivated
          // if (user[0].active === false) {
          //   user[0].active = true;
          //   user[0].save();
          // }

          return res.status(200).json({
            _id: user[0]._id,
            email: user[0].email,
            token: {
              accessToken: accessToken,
              refreshToken: refreshToken,
            },
            role: user[0].role,
            lastLoggedIn: new Date().toISOString(),
            dateCreated: user[0].dateCreated,
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

exports.forgot_password = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      console.log(user);
      if (user.length < 1) {
        return res.status(401).json({
          message: "Email address does not exist",
        });
      }

      const resetToken = user[0].createPasswordResetToken();
      user[0].save({ validateBeforeSave: false });

      try {
        // const resetURL = `${req.protocol}://${req.get(
        //   "host"
        // )}/auth/resetPassword/${resetToken}`;
        const resetURL = `http://127.0.0.1:5173/resetPassword/${resetToken}`;

        // CONFIGURE THIS TO USE THE PROPER USER DETAILS
        // CHECK IF USER_SIGNUP NEEDS CATCHASYNC FUNCTION TO BE ABLE TO ADD AWAIT ONTO NEW EMAIL FUNCTION
        const testUser = {
          firstName: "Zacariah",
          email: "zack@kairaweb.com",
          role: "user",
        };
        new Email(testUser, resetURL).sendPasswordReset();

        res.status(200).json({
          status: "success",
          message: "Token sent to email!",
        });
      } catch (err) {
        console.log(err);
        user[0].passwordResetToken = undefined;
        user[0].passwordResetExpires = undefined;
        user[0].save({ validateBeforeSave: false });

        return next(
          new AppError(
            "There was an error sending the email. Please try again later!"
          ),
          500
        );
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Email address does not exist",
      });
    });
};

exports.reset_password = (req, res, next) => {
  const token = req.params.token;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  User.find({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Not Found! Token is invalid or expired",
        });
      }

      if (user) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err,
            });
          } else {
            user[0].password = hash;

            user[0].passwordResetToken = undefined;
            user[0].passwordResetExpires = undefined;

            const tokenPayload = {
              userId: user[0]._id,
              email: user[0].email,
              role: user[0].role,
            };

            const accessToken = jwt.sign(
              tokenPayload,
              process.env.ACCESS_TOKEN_SECRET,
              {
                expiresIn: "14m", // 14m
              }
            );

            user[0]
              .save()
              .then((result) => {
                res.status(201).json({
                  _id: user[0]._id,
                  email: user[0].email,
                  token: {
                    accessToken: accessToken,
                  },
                  role: user[0].role,
                  dateCreated: user[0].dateCreated,
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
        res
          .status(404)
          .json({ message: "User Not Found! Token is invalid or expired" });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({ message: "Token is invalid or expired" });
    });
};
