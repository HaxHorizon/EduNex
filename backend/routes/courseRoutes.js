import express from 'express';
import Course from '../models/Course.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleCheck.js';
import Resource from '../models/Resource.js';

const router = express.Router();

// Get all courses (for students)
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('teacher', 'fullName email')
      .populate('resources')
      .sort('-createdAt');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Get teacher's courses
router.get('/teacher/my-courses', auth, isTeacher, async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user.userId })
      .populate('resources')
      .populate('students', 'fullName email eid')
      .sort('-createdAt');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Get single course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'fullName email')
      .populate('modules')
      .populate('students', 'fullName email eid')
      .populate('resources')
      .populate('announcements');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
});

// Create course (teacher only)
router.post('/', auth, isTeacher, async (req, res) => {
  try {
    const { title, description, code } = req.body;
    
    // Check if course code already exists
    const existingCourse = await Course.findOne({ code });
    if (existingCourse) {
      return res.status(400).json({ message: 'Course code already exists' });
    }

    const course = new Course({
      title,
      description,
      code,
      teacher: req.user.userId
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

// Update course (teacher only)
router.put('/:id', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, teacher: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
});

// Delete course (teacher only)
router.delete('/:id', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      teacher: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
});

// Get enrolled students for a course (teacher only)
router.get('/:id/students', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('students', 'fullName email eid')
      .select('students');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to view students' });
    }
    
    res.json(course.students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});

// Get student's enrolled courses
router.get('/student/my-courses', auth, async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user.userId })
      .populate('teacher', 'fullName email')
      .populate('resources')
      .sort('-createdAt');
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});

// Add resource to course (teacher only)
router.post('/:courseId/resources', auth, isTeacher, async (req, res) => {
  try {
    const { title, description, type, url } = req.body;
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.teacher.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to add resources to this course' });
    }

    const resource = new Resource({
      title,
      description,
      type,
      url,
      course: course._id,
      uploadedBy: req.user.userId
    });

    await resource.save();
    
    // Add resource to course
    course.resources.push(resource._id);
    await course.save();

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: 'Error adding resource', error: error.message });
  }
});

// Get course resources
router.get('/:courseId/resources', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled or is the teacher
    const isEnrolled = course.students.includes(req.user.userId);
    const isTeacher = course.teacher.toString() === req.user.userId;

    if (!isEnrolled && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view resources' });
    }

    const resources = await Resource.find({ course: course._id })
      .populate('uploadedBy', 'fullName')
      .sort('-createdAt');

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
});

export default router; 