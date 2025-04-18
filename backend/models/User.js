const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  userType: String,
  extraInfo: String,
  eid: { type: String, unique: true },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
