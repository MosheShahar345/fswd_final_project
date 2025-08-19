import { getDb } from '../infra/db.js';

// Get all courses with filtering and sorting
export const getAllCoursesService = async ({ level, search, sort = 'title', order = 'asc' }) => {
  const db = await getDb();
  
  let query = `
    SELECT 
      c.id,
      c.title,
      c.subtitle,
      c.level,
      c.price,
      c.description,
      c.duration,
      c.prerequisites,
      c.max_depth,
      c.active,
      c.created_at,
      COUNT(DISTINCT cs.id) as session_count,
      COUNT(DISTINCT e.id) as enrollment_count
    FROM courses c
    LEFT JOIN course_sessions cs ON c.id = cs.course_id
    LEFT JOIN enrollments e ON cs.id = e.session_id
    WHERE c.active = 1
  `;
  
  const params = [];
  
  if (level) {
    query += ` AND c.level = ?`;
    params.push(level);
  }
  
  if (search) {
    query += ` AND (c.title LIKE ? OR c.description LIKE ? OR c.subtitle LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  query += ` GROUP BY c.id`;
  
  // Validate sort field
  const allowedSortFields = ['title', 'price', 'level', 'created_at'];
  const sortField = allowedSortFields.includes(sort) ? sort : 'title';
  const sortOrder = order.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
  
  query += ` ORDER BY c.${sortField} ${sortOrder}`;
  
  const courses = await db.all(query, params);
  return courses;
};

// Get all courses with sessions for calendar
export const getAllCoursesWithSessionsService = async () => {
  const db = await getDb();
  
  // Get all active courses
  const courses = await db.all(`
    SELECT 
      c.id,
      c.title,
      c.subtitle,
      c.level,
      c.price,
      c.description,
      c.duration,
      c.prerequisites,
      c.max_depth,
      c.active,
      c.created_at
    FROM courses c
    WHERE c.active = 1
    ORDER BY c.title ASC
  `);
  
  // Get sessions for each course
  for (const course of courses) {
    const sessions = await db.all(`
      SELECT 
        cs.id,
        cs.start_at,
        cs.capacity,
        u.name as instructor_name,
        u.email as instructor_email,
        COUNT(e.id) as enrolled_count
      FROM course_sessions cs
      LEFT JOIN users u ON cs.instructor_id = u.id
      LEFT JOIN enrollments e ON cs.id = e.session_id AND e.status = 'enrolled'
      WHERE cs.course_id = ? AND cs.start_at > datetime('now')
      GROUP BY cs.id
      ORDER BY cs.start_at ASC
    `, [course.id]);
    
    course.sessions = sessions;
  }
  
  return courses;
};

// Get course by ID
export const getCourseByIdService = async (id) => {
  const db = await getDb();
  
  const course = await db.get(`
    SELECT 
      c.*,
      COUNT(DISTINCT cs.id) as session_count,
      COUNT(DISTINCT e.id) as enrollment_count
    FROM courses c
    LEFT JOIN course_sessions cs ON c.id = cs.course_id
    LEFT JOIN enrollments e ON cs.id = e.session_id
    WHERE c.id = ? AND c.active = 1
    GROUP BY c.id
  `, [id]);
  
  if (!course) return null;
  
  // Get upcoming sessions for this course
  const sessions = await db.all(`
    SELECT 
      cs.id,
      cs.start_at,
      cs.capacity,
      u.name as instructor_name,
      u.email as instructor_email,
      COUNT(e.id) as enrolled_count
    FROM course_sessions cs
    LEFT JOIN users u ON cs.instructor_id = u.id
    LEFT JOIN enrollments e ON cs.id = e.session_id AND e.status = 'enrolled'
    WHERE cs.course_id = ? AND cs.start_at > datetime('now')
    GROUP BY cs.id
    ORDER BY cs.start_at ASC
  `, [id]);
  
  course.sessions = sessions;
  
  return course;
};

// Create new course
export const createCourseService = async (courseData) => {
  const db = await getDb();
  
  const {
    title,
    subtitle,
    level,
    price,
    description,
    duration,
    prerequisites,
    max_depth
  } = courseData;
  
  const result = await db.run(`
    INSERT INTO courses (title, subtitle, level, price, description, duration, prerequisites, max_depth)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [title, subtitle, level, price, description, duration, prerequisites, max_depth]);
  
  const course = await getCourseByIdService(result.lastID);
  return course;
};

// Update course
export const updateCourseService = async (id, updateData) => {
  const db = await getDb();
  
  // Check if course exists
  const existingCourse = await db.get('SELECT id FROM courses WHERE id = ?', [id]);
  if (!existingCourse) return null;
  
  const {
    title,
    subtitle,
    level,
    price,
    description,
    duration,
    prerequisites,
    max_depth,
    active
  } = updateData;
  
  await db.run(`
    UPDATE courses 
    SET title = ?, subtitle = ?, level = ?, price = ?, description = ?, 
        duration = ?, prerequisites = ?, max_depth = ?, active = ?
    WHERE id = ?
  `, [title, subtitle, level, price, description, duration, prerequisites, max_depth, active, id]);
  
  const course = await getCourseByIdService(id);
  return course;
};

// Delete course (soft delete)
export const deleteCourseService = async (id) => {
  const db = await getDb();
  
  const result = await db.run('UPDATE courses SET active = 0 WHERE id = ?', [id]);
  return result.changes > 0;
};

// Get course statistics
export const getCourseStatsService = async () => {
  const db = await getDb();
  
  const stats = await db.get(`
    SELECT 
      COUNT(*) as total_courses,
      COUNT(CASE WHEN level = 'beginner' THEN 1 END) as beginner_courses,
      COUNT(CASE WHEN level = 'intermediate' THEN 1 END) as intermediate_courses,
      COUNT(CASE WHEN level = 'advanced' THEN 1 END) as advanced_courses,
      COUNT(CASE WHEN level = 'professional' THEN 1 END) as professional_courses,
      AVG(price) as avg_price,
      MIN(price) as min_price,
      MAX(price) as max_price
    FROM courses 
    WHERE active = 1
  `);
  
  // Get enrollment statistics
  const enrollmentStats = await db.get(`
    SELECT 
      COUNT(DISTINCT e.id) as total_enrollments,
      COUNT(DISTINCT e.user_id) as unique_students,
      COUNT(DISTINCT cs.course_id) as courses_with_sessions
    FROM enrollments e
    JOIN course_sessions cs ON e.session_id = cs.id
    WHERE e.status = 'enrolled'
  `);
  
  return {
    ...stats,
    ...enrollmentStats,
    avg_price: Math.round(stats.avg_price * 100) / 100
  };
};

// Enroll in course
export const enrollInCourseService = async (courseId, sessionId, userId) => {
  const db = await getDb();
  
  // Check if course exists
  const course = await db.get('SELECT id FROM courses WHERE id = ? AND active = 1', [courseId]);
  if (!course) {
    throw new Error('Course not found');
  }
  
  // Check if session exists and belongs to the course
  const session = await db.get(`
    SELECT cs.*, COUNT(e.id) as enrolled_count
    FROM course_sessions cs
    LEFT JOIN enrollments e ON cs.id = e.session_id AND e.status = 'enrolled'
    WHERE cs.id = ? AND cs.course_id = ?
    GROUP BY cs.id
  `, [sessionId, courseId]);
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  // Check if user is already enrolled
  const existingEnrollment = await db.get(`
    SELECT id FROM enrollments 
    WHERE session_id = ? AND user_id = ? AND status = 'enrolled'
  `, [sessionId, userId]);
  
  if (existingEnrollment) {
    throw new Error('Already enrolled');
  }
  
  // Check if session is full
  if (session.enrolled_count >= session.capacity) {
    throw new Error('Session full');
  }
  
  // Create enrollment
  const result = await db.run(`
    INSERT INTO enrollments (session_id, user_id, status)
    VALUES (?, ?, 'enrolled')
  `, [sessionId, userId]);
  
  const enrollment = await db.get(`
    SELECT 
      e.*,
      c.title as course_title,
      c.subtitle as course_subtitle,
      cs.start_at,
      u.name as instructor_name
    FROM enrollments e
    JOIN course_sessions cs ON e.session_id = cs.id
    JOIN courses c ON cs.course_id = c.id
    JOIN users u ON cs.instructor_id = u.id
    WHERE e.id = ?
  `, [result.lastID]);
  
  return enrollment;
};

// Get course enrollments
export const getEnrollmentsService = async (courseId) => {
  const db = await getDb();
  
  const enrollments = await db.all(`
    SELECT 
      e.id,
      e.status,
      e.created_at,
      u.name as student_name,
      u.email as student_email,
      cs.start_at,
      u_instructor.name as instructor_name
    FROM enrollments e
    JOIN course_sessions cs ON e.session_id = cs.id
    JOIN users u ON e.user_id = u.id
    JOIN users u_instructor ON cs.instructor_id = u_instructor.id
    WHERE cs.course_id = ?
    ORDER BY e.created_at DESC
  `, [courseId]);
  
  return enrollments;
};

// Cancel enrollment
export const cancelEnrollmentService = async (enrollmentId, userId) => {
  const db = await getDb();
  
  // Get enrollment details
  const enrollment = await db.get(`
    SELECT 
      e.*,
      cs.start_at,
      c.title as course_title
    FROM enrollments e
    JOIN course_sessions cs ON e.session_id = cs.id
    JOIN courses c ON cs.course_id = c.id
    WHERE e.id = ?
  `, [enrollmentId]);
  
  if (!enrollment) {
    throw new Error('Enrollment not found');
  }
  
  // Check if user owns this enrollment
  if (enrollment.user_id !== userId) {
    throw new Error('Unauthorized');
  }
  
  // Check if enrollment is already cancelled or dropped
  if (enrollment.status === 'cancelled' || enrollment.status === 'dropped') {
    throw new Error('Enrollment already cancelled');
  }
  
  // Check if course starts within 24 hours
  const now = new Date();
  const courseStart = new Date(enrollment.start_at);
  const timeDifference = courseStart.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  
  if (hoursDifference < 24) {
    throw new Error('Cannot cancel - course starts within 24 hours');
  }
  
  // Update enrollment status to dropped (since 'cancelled' is not in the current constraint)
  await db.run(`
    UPDATE enrollments 
    SET status = 'dropped'
    WHERE id = ?
  `, [enrollmentId]);
  
  return {
    id: enrollmentId,
    status: 'dropped',
    course_title: enrollment.course_title,
    message: 'Enrollment cancelled successfully'
  };
};
