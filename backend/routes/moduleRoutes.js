import express from 'express';
import Module from '../models/Module.js';
import Course from '../models/Course.js';
import auth from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all modules for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled in the course or is the teacher
    const isEnrolled = course.students.includes(req.user.id);
    const isTeacher = course.teacher.toString() === req.user.id;

    if (!isEnrolled && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view modules for this course' });
    }

    const modules = await Module.find({ course: req.params.courseId })
      .sort('order');
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching modules', error: error.message });
  }
});

// Get a single module
router.get('/:id', auth, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const course = await Course.findById(module.course);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled in the course or is the teacher
    const isEnrolled = course.students.includes(req.user.id);
    const isTeacher = course.teacher.toString() === req.user.id;

    if (!isEnrolled && !isTeacher) {
      return res.status(403).json({ message: 'Not authorized to view this module' });
    }

    res.json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching module', error: error.message });
  }
});

// Create a module (teacher only)
router.post('/', auth, isTeacher, async (req, res) => {
  try {
    const { title, description, course, order } = req.body;

    // Verify that the course belongs to the teacher
    const courseExists = await Course.findOne({
      _id: course,
      teacher: req.user.id
    });
    if (!courseExists) {
      return res.status(403).json({ message: 'Not authorized to create modules for this course' });
    }

    const newModule = new Module({
      title,
      description,
      course,
      order
    });

    await newModule.save();
    res.status(201).json(newModule);
  } catch (error) {
    res.status(500).json({ message: 'Error creating module', error: error.message });
  }
});

// Update a module (teacher only)
router.put('/:id', auth, isTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Verify that the course belongs to the teacher
    const course = await Course.findOne({
      _id: module.course,
      teacher: req.user.id
    });
    if (!course) {
      return res.status(403).json({ message: 'Not authorized to update this module' });
    }

    const updatedModule = await Module.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedModule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating module', error: error.message });
  }
});

// Delete a module (teacher only)
router.delete('/:id', auth, isTeacher, async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Verify that the course belongs to the teacher
    const course = await Course.findOne({
      _id: module.course,
      teacher: req.user.id
    });
    if (!course) {
      return res.status(403).json({ message: 'Not authorized to delete this module' });
    }

    await module.deleteOne();
    res.json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting module', error: error.message });
  }
});

export default router; 