const express = require("express");
const multer = require("multer");
const path = require("path");
const Profile = require("../models/Profile");
const auth = require("../middleware/auth");

const router = express.Router();

// Image upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, "_")}`),
});
const upload = multer({ storage });

// Get profile
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save profile
router.post("/", auth, async (req, res) => {
  try {
    const existing = await Profile.findOne({ userId: req.user.id });
    if (existing) {
      await Profile.updateOne({ userId: req.user.id }, req.body);
    } else {
      await Profile.create({ ...req.body, userId: req.user.id });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save profile" });
  }
});

// Upload profile image
router.post("/image", auth, upload.single("profileImage"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  await Profile.findOneAndUpdate({ userId: req.user.id }, { profileImageUrl: imageUrl });
  res.json({ imageUrl });
});

module.exports = router;
