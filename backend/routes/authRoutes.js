import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role, eid } = req.body;
    
    // Validate required fields
    if (!fullName || !email || !password || !role || !eid) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { eid }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email or EID already exists' });
    }

    // Create new user
    const user = new User({
      fullName,
      email,
      password,
      role,
      eid
    });

    await user.save();

    // Create profile for the user
    const profile = new Profile({
      user: user._id,
      bio: '',
      profileImage: '',
      phone: '',
      address: '',
      education: [],
      experience: [],
      skills: [],
      socialLinks: {
        linkedin: '',
        github: '',
        twitter: ''
      }
    });

    await profile.save();

    // Update user with profile reference
    user.profile = profile._id;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        eid: user.eid
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).populate('profile');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        eid: user.eid,
        profile: user.profile
      },
      redirectTo: user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('profile');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        eid: user.eid,
        profile: user.profile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

export default router; 