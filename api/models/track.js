const mongoose = require("mongoose");

const trackSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Connects this Track to the User model
    required: true,
  },
  trackArray: {
    type: String,
    default: undefined,
  },
});

module.exports = mongoose.model("Track", trackSchema);
