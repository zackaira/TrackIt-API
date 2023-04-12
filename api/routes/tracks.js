const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  res.status(200).json({
    message: "displaying all tracks",
  });
});

router.post("/:id", (req, res, next) => {
  res.status(200).json({
    message: "Handling POST requests to tracks",
  });
});

router.patch("/:id", (req, res, next) => {
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

module.exports = router;
