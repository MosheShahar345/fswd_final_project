import express from 'express';
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCourseStats,
  enrollInCourse,
  getEnrollments
} from '../controllers/courseController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { validateCourse, validateEnrollment } from '../validators/courses.js';

const router = express.Router();

// Public routes
router.get('/', getAllCourses);
router.get('/stats', getCourseStats);
router.get('/:id', getCourseById);

// Protected routes
router.post('/', authenticateToken, validateCourse, createCourse);
router.put('/:id', authenticateToken, validateCourse, updateCourse);
router.delete('/:id', authenticateToken, deleteCourse);

// Enrollment routes
router.post('/:id/enroll', authenticateToken, validateEnrollment, enrollInCourse);
router.get('/:id/enrollments', authenticateToken, getEnrollments);

export default router;
