import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./models/User.js"; // Assuming you have this User model file

dotenv.config();

const app = express();
const SECRET_KEY = "283ed155c25ecd611ba27aceb1c75c4889ee1cfd77b21baff4f516ed5b6c63215cd2f3577ca580f7fd6e99a7c56100cb7d9fa271e2fd31a2d4c8a0d37e7fe680c02352fc06b9361dcc59c505dc33747f95fd9948d8bbc874f9cff8b9d0a13bff3cc0a28d8ae3436bdf3beaa0d3ebc37cbe957e1577424db236de20e3267713b7"; // Make sure to keep this secret and secure

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Register route
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password, userType, extraInfo } = req.body;

    if (!fullName || !email || !password || !userType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({
      fullName,
      email,
      password,
      userType,
      extraInfo,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error in /api/register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    if (!email || !password || !userType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password || user.userType !== userType) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error in /api/login:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Server listener
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
