const express = require("express");
const app = express();

const usersRoutes = require("./api/routes/users");
const trackRoutes = require("./api/routes/tracks");

app.use("/users", usersRoutes);
app.use("/tracks", trackRoutes);

module.exports = app;
