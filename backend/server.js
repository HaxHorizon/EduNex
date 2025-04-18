import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import Profile from "./models/Profile.js";
import multer from "multer";
import path from "path";
import nodemailer from "nodemailer";
import http from "http";
import { Server } from "socket.io";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const SECRET_KEY = process.env.JWT_SECRET;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password, userType, extraInfo, eid } = req.body;

    if (!fullName || !email || !password || !userType || !eid) {
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
      eid,
    });

    await newUser.save();

    // Send formatted email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamhaxhorizon@gmail.com",
        pass: "abrk vcgv aemo kucn",
      },
    });

    const mailOptions = {
      from: '"Edunex Registration" teamhaxhorizon@gmail.com',
      to: "teamhaxhorizon@gmail.com",
      subject: "📝 New User Registered on Edunex",
      html: `
  <h2 style="color:#2e6c80;">📋 New User Registration - Edunex</h2>
  <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
    <thead>
      <tr style="background-color: #f2f2f2;">
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Field</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Value</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">EID</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${eid}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Full Name</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${fullName}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Email</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${email}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">User Type</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${userType}</td>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">
          ${userType === "student" ? "Grade/Class" : "Subject Specialization"}
        </td>
        <td style="border: 1px solid #ddd; padding: 8px;">${extraInfo}</td>
      </tr>
    </tbody>
  </table>
  <p style="margin-top:20px; font-size: 0.9em; color: #888;">
    This is an automated message from Edunex.
  </p>
`,
    };

    await transporter.sendMail(mailOptions);

    const userMailOptions = {
      from: '"Edunex Team" <teamhaxhorizon@gmail.com>',
      to: email,
      subject: `🎉 Welcome to Edunex, ${fullName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #4A90E2;">Welcome to Edunex, ${fullName} 👋</h2>
          <p>We’re thrilled to have you on board as a <strong>${userType}</strong>!</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px;">Your Details</th>
                <th style="border: 1px solid #ddd; padding: 8px;"></th>
              </tr>
            </thead>
            <tbody>
              <tr><td style="border: 1px solid #ddd; padding: 8px;">EID</td><td style="border: 1px solid #ddd; padding: 8px;">${eid}</td></tr>
              <tr><td style="border: 1px solid #ddd; padding: 8px;">Email</td><td style="border: 1px solid #ddd; padding: 8px;">${email}</td></tr>
              <tr><td style="border: 1px solid #ddd; padding: 8px;">User Type</td><td style="border: 1px solid #ddd; padding: 8px;">${userType}</td></tr>
              <tr><td style="border: 1px solid #ddd; padding: 8px;">${userType === "student" ? "Grade/Class" : "Subject Specialization"}</td><td style="border: 1px solid #ddd; padding: 8px;">${extraInfo}</td></tr>
            </tbody>
          </table>
          <p style="margin-top: 20px;">If you have any questions, feel free to reply to this email or reach us at <a href="mailto:teamhaxhorizon@gmail.com">teamhaxhorizon@gmail.com</a>.</p>
          <p>🚀 Welcome aboard!<br>— The Edunex Team</p>
        </div>
      `,
    };

    await transporter.sendMail(userMailOptions);


    res.status(201).json({ message: "User registered & email sent" });
  } catch (err) {
    console.error("Error in /api/register:", err);
    res.status(500).json({ message: "Server error" });
  }
});

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

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error in /api/me:", err);
    res.status(500).json({ message: "Server error" });
  }
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const fileName = `profile_${req.user.userId}${ext}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage });

// GET /api/profile - fetch current profile
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const profile = await Profile.findOne({ eid: user.eid });
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    const profileImageUrl = `/uploads/profile_${user._id}.jpg`; // Assuming JPG

    res.json({
      ...profile.toObject(),
      profileImageUrl
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/profile - create or update profile
app.post("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const data = req.body;
    const existing = await Profile.findOne({ eid: user.eid });

    if (existing) {
      await Profile.updateOne({ eid: user.eid }, data);
    } else {
      const newProfile = new Profile({ ...data, eid: user.eid });
      await newProfile.save();
    }

    res.json({ message: "Profile saved successfully" });
  } catch (err) {
    console.error("Error saving profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/profile/image - upload profile image
app.post("/api/profile/image", authenticateToken, upload.single("profileImage"), (req, res) => {
  try {
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ message: "Image uploaded", imageUrl });
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ message: "Image upload failed" });
  }
});

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.get("/api/users", authenticateToken, async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user.userId } }).select(
    "fullName email _id"
  );
  res.json(users);
});
server.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
