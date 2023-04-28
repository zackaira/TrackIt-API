require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Import API Routes
const authRoutes = require("./api/routes/auth");
const userRoutes = require("./api/routes/user");
const trackRoutes = require("./api/routes/track");

// Connect to MongoDB database
mongoose.connect(
  `mongodb+srv://zackaira:${process.env.MONGO_ATLAS_PW}@node-trackit-app.i0z7bnd.mongodb.net/?retryWrites=true&w=majority`
);
mongoose.Promise = global.Promise;

// Use Morgan for logging
app.use(morgan("dev")); //Eg: GET /user/ 200 0.809 ms - 45
app.use("/uploads", express.static("uploads")); // Make /uploads folder accessible by all
// Use Body Parser to extract data as json so it's easier to work with
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setup CORS headers
// Allow all servers/origins to access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// Use Routes witth Express
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/track", trackRoutes);

// Handle errors Routes not found 404
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});
// Handle db errors 500
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
