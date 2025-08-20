import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { formatDateTime } from '../../utils/dateUtils.js';
import './CourseDetail.css';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, isItemInCart } = useCart();
  const { showSuccess } = useNotification();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

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

  const handleAddToCart = () => {
    if (!user) {
      showSuccess('Please log in to add courses to cart');
      return;
    }

    if (!selectedSession) {
      showSuccess('Please select a session to add to cart');
      return;
    }

    const courseItem = {
      courseId: course.id,
      sessionId: selectedSession.id,
      name: course.title,
      coursePrice: parseFloat(course.price) || 0,
      sessionDate: selectedSession.start_at,
      level: course.level
    };
    


    addToCart(courseItem, 1, 'course');
    showSuccess('Course added to cart!');
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
                                            <p className="session-date">{formatDateTime(session.start_at)}</p>
                    <p className="session-instructor">Capacity: {session.enrolled_count}/{session.capacity}</p>
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
              <h3>Add to Cart</h3>
                                      <p>Session {selectedSession.id} - {formatDateTime(selectedSession.start_at)}</p>
              <p>Capacity: {selectedSession.enrolled_count}/{selectedSession.capacity}</p>
              
              <button 
                className="btn btn-primary enroll-btn"
                onClick={handleAddToCart}
                disabled={isItemInCart(`course-${course.id}-${selectedSession.id}`, 'course')}
              >
                {isItemInCart(`course-${course.id}-${selectedSession.id}`, 'course') ? 'Added to Cart' : `Add to Cart - $${course.price}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
