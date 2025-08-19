import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import EventCalendar from '../components/CourseCalendar.jsx';
import './Activities.css';

const Activities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'trips');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const { showSuccess } = useNotification();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Fetch courses from API
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/courses');
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      const data = await response.json();
      
      // Sort courses by level (beginner, intermediate, advanced, professional)
      const sortedCourses = (data.data || []).sort((a, b) => {
        const levelOrder = { beginner: 1, intermediate: 2, advanced: 3, professional: 4 };
        return levelOrder[a.level] - levelOrder[b.level];
      });
      
      setCourses(sortedCourses);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch course statistics
  const fetchCourseStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/stats');
      if (response.ok) {
        const data = await response.json();
        setCourseStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching course stats:', err);
    }
  }, []);



  // Load data when component mounts
  useEffect(() => {
    fetchCourses();
    fetchCourseStats();
  }, [fetchCourses, fetchCourseStats]);

  return (
    <div className="activities">
      <div className="activities-header">
        <h1>Activities</h1>
        <p>Join our guided adventures and expert-led courses</p>
      </div>

      <div className="activities-tabs">
        <button
          className={`tab-button ${activeTab === 'trips' ? 'active' : ''}`}
          onClick={() => handleTabChange('trips')}
        >
          🏕️ Trips
        </button>
        <button
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => handleTabChange('courses')}
        >
          🎓 Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabChange('calendar')}
        >
          📅 Calendar
        </button>
      </div>

      <div className="activities-content">
        {activeTab === 'trips' ? (
          <div className="trips-section">
            <h2>Diving Adventures & Trips</h2>
            <p className="courses-intro">
              Explore the world's most beautiful underwater destinations with our guided diving trips. 
              From local reef dives to exotic international expeditions, we offer unforgettable underwater experiences.
            </p>
            <div className="activities-grid">
              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🐠</div>
                </div>
                <div className="activity-info">
                  <h3>Great Barrier Reef Expedition</h3>
                  <p className="activity-location">Cairns, Australia</p>
                  <p className="activity-dates">September 15-22, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-primary">Intermediate</span>
                    <span className="seats-left">6 seats left</span>
                  </div>
                  <div className="activity-price">$2,499.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🦈</div>
                </div>
                <div className="activity-info">
                  <h3>Shark Diving Adventure</h3>
                  <p className="activity-location">Gansbaai, South Africa</p>
                  <p className="activity-dates">October 5-10, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-warning">Advanced</span>
                    <span className="seats-left">4 seats left</span>
                  </div>
                  <div className="activity-price">$1,899.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🐋</div>
                </div>
                <div className="activity-info">
                  <h3>Whale Watching Dive</h3>
                  <p className="activity-location">Tonga</p>
                  <p className="activity-dates">July 20-27, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-success">Beginner</span>
                    <span className="seats-left">8 seats left</span>
                  </div>
                  <div className="activity-price">$1,599.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🪸</div>
                </div>
                <div className="activity-info">
                  <h3>Caribbean Reef Discovery</h3>
                  <p className="activity-location">Bonaire, Caribbean</p>
                  <p className="activity-dates">November 10-17, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-primary">Intermediate</span>
                    <span className="seats-left">10 seats left</span>
                  </div>
                  <div className="activity-price">$1,299.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'courses' ? (
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
                  courses.map((course) => {
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

                    return (
                      <div key={course.id} className="activity-card course-card">
                        <div className="activity-image">
                          <div className="image-placeholder">{getLevelIcon(course.level)}</div>
                          <div className="course-level-badge">{getLevelBadge(course.level)}</div>
                        </div>
                        <div className="activity-info">
                          <h3>{course.title}</h3>
                          <p className="course-subtitle">{course.subtitle}</p>
                          <p className="course-description">{course.description}</p>
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
                    );
                  })
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <EventCalendar />
        )}
      </div>
    </div>
  );
};

export default Activities;
