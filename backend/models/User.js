import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  userType: String,
  extraInfo: String,
});

const User = mongoose.model("User", userSchema);

export default User;
