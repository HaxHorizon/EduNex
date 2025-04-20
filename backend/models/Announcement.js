import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  teacherName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;
