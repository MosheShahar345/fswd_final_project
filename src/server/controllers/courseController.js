import { 
  getAllCoursesService, 
  getAllCoursesWithSessionsService,
  getCourseByIdService, 
  createCourseService, 
  updateCourseService, 
  deleteCourseService,
  getCourseStatsService,
  enrollInCourseService,
  getEnrollmentsService,
  cancelEnrollmentService
} from '../services/courseService.js';

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const { level, search, sort = 'title', order = 'asc' } = req.query;
    // Check if this is an admin request (from /admin/all route)
    const includeInactive = req.route.path === '/admin/all';
    
    const courses = await getAllCoursesService({ level, search, sort, order, includeInactive });
    
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get all courses with sessions for calendar
export const getAllCoursesWithSessions = async (req, res) => {
  try {
    const courses = await getAllCoursesWithSessionsService();
    
    res.json({
      success: true,
      data: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses with sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get course by ID
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await getCourseByIdService(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Create new course
export const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const course = await createCourseService(courseData);
    
    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Update course
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const course = await updateCourseService(id, updateData);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCourseService(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get course statistics
export const getCourseStats = async (req, res) => {
  try {
    const stats = await getCourseStatsService();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching course stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Enroll in course
export const enrollInCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;
    const userId = req.user.id;
    
    const enrollment = await enrollInCourseService(id, sessionId, userId);
    
    res.status(201).json({
      success: true,
      data: enrollment,
      message: 'Successfully enrolled in course'
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    
    if (error.message === 'Course not found') {
      return res.status(404).json({
        success: false,
        error: 'Course not found'
      });
    }
    
    if (error.message === 'Session not found') {
      return res.status(404).json({
        success: false,
        error: 'Course session not found'
      });
    }
    
    if (error.message === 'Already enrolled') {
      return res.status(400).json({
        success: false,
        error: 'Already enrolled in this course session'
      });
    }
    
    if (error.message === 'Session full') {
      return res.status(400).json({
        success: false,
        error: 'Course session is full'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Get course enrollments
export const getEnrollments = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollments = await getEnrollmentsService(id);
    
    res.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    });
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Cancel enrollment
export const cancelEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;
    
    const result = await cancelEnrollmentService(enrollmentId, userId);
    
    res.json({
      success: true,
      data: result,
      message: 'Enrollment cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling enrollment:', error);
    
    if (error.message === 'Enrollment not found') {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found'
      });
    }
    
    if (error.message === 'Unauthorized') {
      return res.status(403).json({
        success: false,
        error: 'You can only cancel your own enrollments'
      });
    }
    
    if (error.message === 'Cannot cancel - course starts within 24 hours') {
      return res.status(400).json({
        success: false,
        error: 'Cannot cancel enrollment. Course starts within 24 hours.'
      });
    }
    
    if (error.message === 'Enrollment already cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Enrollment is already cancelled'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
