import express from "express";
import Announcement from "../models/Announcement.js";

const router = express.Router();

// Create Announcement
router.post("/", async (req, res) => {
  try {
    const { title, description, teacherName } = req.body;
    if (!title || !description || !teacherName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newAnnouncement = new Announcement({ title, description, teacherName });
    await newAnnouncement.save();

    res.status(201).json({ message: "Announcement created successfully", newAnnouncement });
  } catch (err) {
    console.error("Error in creating announcement:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get All Announcements
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (err) {
    console.error("Error in fetching announcements:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
