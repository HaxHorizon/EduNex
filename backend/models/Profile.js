const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  date: String,
});

const profileSchema = new mongoose.Schema({
    eid: { type: String, required: true, unique: true },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      dob: String,
      bio: String,
      location: String,
      website: String,
    },
    academicInfo: {
      major: String,
      minor: String,
      year: String,
      gpa: String,
      expectedGraduation: String,
      advisor: String,
    },
    achievements: [
      {
        title: String,
        description: String,
        date: String,
      }
    ],
    interests: [String],
  });
  
module.exports = mongoose.model("Profile", profileSchema);
