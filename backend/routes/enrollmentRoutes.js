import express from 'express';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { isTeacher } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all enrollments for a course (teacher only)
router.get('/course/:courseId', auth, isTeacher, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Verify that the course belongs to the teacher
    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
    }

    const enrollments = await Enrollment.find({ course: req.params.courseId })
      .populate('student', 'fullName email eid')
      .populate('approvedBy', 'fullName')
      .sort('-enrolledAt');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
});

// Get student's enrollments
router.get('/student/my-enrollments', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user.id })
      .populate('course', 'title code description teacher')
      .populate('approvedBy', 'fullName')
      .sort('-enrolledAt');
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
});

// Request enrollment in a course (student only)
router.post('/', auth, async (req, res) => {
  try {
    const { courseId } = req.body;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId
    });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      student: req.user.id,
      course: courseId,
      status: 'pending'
    });

    await enrollment.save();
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Error creating enrollment', error: error.message });
  }
});

// Approve/reject enrollment (teacher only)
router.patch('/:id/status', auth, isTeacher, async (req, res) => {
  try {
    const { status } = req.body;
    const enrollment = await Enrollment.findById(req.params.id);
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Verify that the course belongs to the teacher
    const course = await Course.findOne({
      _id: enrollment.course,
      teacher: req.user.id
    });
    if (!course) {
      return res.status(403).json({ message: 'Not authorized to update this enrollment' });
    }

    enrollment.status = status;
    enrollment.approvedAt = new Date();
    enrollment.approvedBy = req.user.id;

    if (status === 'approved') {
      course.students.push(enrollment.student);
      await course.save();
    }

    await enrollment.save();
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating enrollment', error: error.message });
  }
});

// Delete enrollment
router.delete('/:id', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Only allow deletion if the user is the student or the course teacher
    const course = await Course.findById(enrollment.course);
    if (enrollment.student.toString() !== req.user.id && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this enrollment' });
    }

    // If enrollment was approved, remove student from course
    if (enrollment.status === 'approved') {
      course.students = course.students.filter(
        studentId => studentId.toString() !== enrollment.student.toString()
      );
      await course.save();
    }

    await enrollment.deleteOne();
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting enrollment', error: error.message });
  }
});

export default router; 