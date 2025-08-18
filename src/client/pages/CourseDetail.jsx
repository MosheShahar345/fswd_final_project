import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }
      const data = await response.json();
      setCourse(data.data);
      
      // Auto-select first available session
      if (data.data.sessions && data.data.sessions.length > 0) {
        setSelectedSession(data.data.sessions[0]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user || !token) {
      setEnrollmentError('Please log in to enroll in courses');
      return;
    }

    if (!selectedSession) {
      setEnrollmentError('Please select a session to enroll in');
      return;
    }

    setEnrolling(true);
    setEnrollmentError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${id}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: selectedSession.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enroll in course');
      }

      alert('Successfully enrolled in course!');
      fetchCourse(); // Refresh course data
    } catch (err) {
      setEnrollmentError(err.message);
      console.error('Error enrolling in course:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  if (loading) {
    return (
      <div className="course-detail">
        <div className="loading-message">
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-detail">
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchCourse} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail">
        <div className="error-message">
          <p>Course not found</p>
          <Link to="/activities" className="btn btn-primary">Back to Activities</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail">
      <div className="course-detail-header">
        <Link to="/activities" className="back-link">← Back to Activities</Link>
        <h1>{course.title}</h1>
        <p className="course-subtitle">{course.subtitle}</p>
      </div>

      <div className="course-detail-content">
        <div className="course-main-info">
          <div className="course-hero">
            <div className="course-image">
              <div className="image-placeholder">{getLevelIcon(course.level)}</div>
              <div className="course-level-badge">{getLevelBadge(course.level)}</div>
            </div>
            <div className="course-overview">
              <div className="course-price">${course.price}</div>
              <span className={`badge ${getBadgeClass(course.level)}`}>
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </span>
              <p className="course-description">{course.description}</p>
            </div>
          </div>

          <div className="course-details-grid">
            <div className="detail-card">
              <h3>Duration</h3>
              <p>{course.duration}</p>
            </div>
            <div className="detail-card">
              <h3>Prerequisites</h3>
              <p>{course.prerequisites}</p>
            </div>
            <div className="detail-card">
              <h3>Maximum Depth</h3>
              <p>{course.max_depth}</p>
            </div>
            <div className="detail-card">
              <h3>Available Sessions</h3>
              <p>{course.session_count || 0} sessions</p>
            </div>
          </div>
        </div>

        <div className="course-sessions">
          <h2>Available Sessions</h2>
          
          {enrollmentError && (
            <div className="error-message">
              <p>{enrollmentError}</p>
              <button onClick={() => setEnrollmentError(null)} className="btn btn-primary">Dismiss</button>
            </div>
          )}

          {course.sessions && course.sessions.length > 0 ? (
            <div className="sessions-list">
              {course.sessions.map((session) => (
                <div 
                  key={session.id} 
                  className={`session-card ${selectedSession?.id === session.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="session-info">
                    <h3>Session {session.id}</h3>
                    <p className="session-date">{formatDate(session.start_at)}</p>
                    <p className="session-instructor">Instructor: {session.instructor_name}</p>
                    <p className="session-capacity">
                      {session.enrolled_count}/{session.capacity} enrolled
                    </p>
                  </div>
                  <div className="session-status">
                    {session.enrolled_count >= session.capacity ? (
                      <span className="badge badge-danger">Full</span>
                    ) : (
                      <span className="badge badge-success">Available</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sessions">
              <p>No sessions are currently scheduled for this course.</p>
              <p>Please check back later or contact us for more information.</p>
            </div>
          )}

          {selectedSession && selectedSession.enrolled_count < selectedSession.capacity && (
            <div className="enrollment-section">
              <h3>Enroll in Selected Session</h3>
              <p>Session {selectedSession.id} - {formatDate(selectedSession.start_at)}</p>
              <p>Instructor: {selectedSession.instructor_name}</p>
              <p>Available spots: {selectedSession.capacity - selectedSession.enrolled_count}</p>
              
              <button 
                className="btn btn-primary enroll-btn"
                onClick={handleEnroll}
                disabled={enrolling}
              >
                {enrolling ? 'Enrolling...' : `Enroll Now - $${course.price}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
