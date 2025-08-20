import React from 'react';
import { Link } from 'react-router-dom';

const CoursesSection = ({ courses, loading, error, courseStats, fetchCourses }) => {
  const getLevelIcon = (level) => {
    switch (level) {
      case 'beginner': return '🤿';
      case 'intermediate': return '🌊';
      case 'advanced': return '🏆';
      case 'professional': return '👨‍🏫';
      default: return '🎓';
    }
  };

  const getLevelBadge = (level) => {
    switch (level) {
      case 'beginner': return 'Level 1';
      case 'intermediate': return 'Level 2';
      case 'advanced': return 'Level 3';
      case 'professional': return 'Professional';
      default: return level;
    }
  };

  const getBadgeClass = (level) => {
    switch (level) {
      case 'beginner': return 'badge-success';
      case 'intermediate': return 'badge-primary';
      case 'advanced': return 'badge-warning';
      case 'professional': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  const getDescription = (course) => {
    if (course.level === 'beginner' && course.title === 'Open Water Diver') {
      return 'Your first step into the underwater world. Learn essential diving skills and safety procedures.';
    } else if (course.level === 'intermediate' && course.title === 'Advanced Open Water Diver') {
      return 'Expand your diving horizons with advanced techniques, deep diving, and specialized underwater navigation skills.';
    } else if (course.level === 'advanced' && course.title === 'Master Diver') {
      return 'Achieve the highest recreational diving certification. Master advanced skills and rescue techniques.';
    } else if (course.level === 'professional' && course.title === 'Divemaster') {
      return 'Begin your professional diving career. Learn to lead dives and become a certified diving professional.';
    } else {
      return course.description;
    }
  };

  return (
    <div className="courses-section">
      <h2>Diving Certification Courses</h2>
      <p className="courses-intro">
        Start your underwater journey with our comprehensive diving certification courses. 
        From beginner to professional level, we offer structured training programs designed 
        to make you a confident and skilled diver.
      </p>
      
      {courseStats && (
        <div className="course-stats">
          <div className="stat-item">
            <span className="stat-number">{courseStats.total_enrollments || 0}</span>
            <span className="stat-label">Total Enrollments</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{courseStats.unique_students || 0}</span>
            <span className="stat-label">Active Students</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="loading-message">
          <p>Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchCourses} className="btn btn-primary">Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="activities-grid">
          {courses.length === 0 ? (
            <div className="no-courses">
              <p>No courses available at the moment.</p>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="activity-card course-card">
                <div className="activity-image">
                  <div className="image-placeholder">{getLevelIcon(course.level)}</div>
                  <div className="course-level-badge">{getLevelBadge(course.level)}</div>
                </div>
                <div className="activity-info">
                  <h3>{course.title}</h3>
                  <p className="course-subtitle">{course.subtitle}</p>
                  <p className="course-description">
                    {getDescription(course)}
                  </p>
                  <div className="course-details">
                    <div className="detail-item">
                      <span className="detail-label">Duration:</span>
                      <span className="detail-value">{course.duration}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Prerequisites:</span>
                      <span className="detail-value">{course.prerequisites}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Max Depth:</span>
                      <span className="detail-value">{course.max_depth}</span>
                    </div>
                  </div>
                  <div className="activity-meta">
                    <span className={`badge ${getBadgeClass(course.level)}`}>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </span>
                    <span className="seats-left">
                      {course.session_count > 0 ? `${course.session_count} sessions available` : 'No sessions scheduled'}
                    </span>
                  </div>
                  <div className="activity-price">${course.price}</div>
                  <div className="course-actions">
                    <Link 
                      to={`/activities/course/${course.id}`} 
                      className="btn btn-primary"
                    >
                      View Details & Enroll
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CoursesSection;
