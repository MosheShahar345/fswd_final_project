import express from 'express';
import {
  getAllCourses,
  getAllCoursesWithSessions,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStats,
  enrollInCourse,
  getEnrollments,
  cancelEnrollment
} from '../controllers/courseController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCourse, validateEnrollment } from '../validators/courses.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/calendar', getAllCoursesWithSessions);
router.get('/stats', getCourseStats);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', authenticateToken, validateCourse, createCourse);
router.put('/:id', authenticateToken, validateCourse, updateCourse);
router.delete('/:id', authenticateToken, deleteCourse);

// Enrollment routes
router.post('/:id/enroll', authenticateToken, validateEnrollment, enrollInCourse);
router.get('/:id/enrollments', authenticateToken, getEnrollments);
router.patch('/enrollments/:enrollmentId/cancel', authenticateToken, cancelEnrollment);

export default router;
