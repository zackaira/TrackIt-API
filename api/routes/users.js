const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Handling GET requests to /users",
  });
});

router.post("/", (req, res, next) => {
  res.status(200).json({
    message: "Handling POST requests to /users",
  });
});

router.get("/:id", (req, res, next) => {
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

router.patch("/:id", (req, res, next) => {
  res.status(200).json({
    message: "Updated user!",
  });
});

router.delete("/:id", (req, res, next) => {
  res.status(200).json({
    message: "Deleted user by ID!",
  });
});

module.exports = router;
