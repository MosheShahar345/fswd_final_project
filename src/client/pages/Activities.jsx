import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import EventCalendar from '../components/CourseCalendar.jsx';
import { formatDateRange } from '../utils/dateUtils.js';
import './Activities.css';

const Activities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'trips');
  const [courses, setCourses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [courseStats, setCourseStats] = useState(null);

  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const { showSuccess, showError } = useNotification();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleBookTrip = (trip) => {
    const existingTrip = cart.find(item => item.type === 'trip' && item.id === trip.id);
    
    if (existingTrip) {
      showError(`${trip.title} is already in your cart!`);
      return;
    }
    
    try {
      addToCart(trip, 1, 'trip');
      showSuccess(`${trip.title} added to cart!`);
    } catch (error) {
      showError(`Failed to add ${trip.title} to cart: ${error.message}`);
    }
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

  // Fetch trips from API
  const fetchTrips = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trips');
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      const data = await response.json();
      setTrips(data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
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
    fetchTrips();
    fetchCourseStats();
  }, [fetchCourses, fetchTrips, fetchCourseStats]);

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
            <h2>Diving Adventures & Marine Expeditions</h2>
            <p className="courses-intro">
              Explore the world's most spectacular diving destinations. 
              From thrilling shark encounters to vibrant coral reefs and blue holes, we offer unforgettable underwater experiences for all skill levels.
            </p>
            <div className="activities-grid">
              {trips.length === 0 ? (
                <div className="no-trips">
                  <p>No trips available at the moment.</p>
                </div>
              ) : (
                trips.map((trip) => {
                  const getDifficultyIcon = (difficulty) => {
                    switch (difficulty) {
                      case 'easy': return '🐠';
                      case 'moderate': return '🪸';
                      case 'hard': return '🦈';
                      case 'expert': return '🏆';
                      default: return '🐠';
                    }
                  };

                  const getDifficultyBadge = (difficulty) => {
                    switch (difficulty) {
                      case 'easy': return 'Easy';
                      case 'moderate': return 'Moderate';
                      case 'hard': return 'Hard';
                      case 'expert': return 'Expert';
                      default: return difficulty;
                    }
                  };

                  const getBadgeClass = (difficulty) => {
                    switch (difficulty) {
                      case 'beginner': return 'badge-success';
                      case 'intermediate': return 'badge-primary';
                      case 'advanced': return 'badge-warning';
                      case 'expert': return 'badge-danger';
                      default: return 'badge-primary';
                    }
                  };

                  const seatsLeft = trip.seats_total - trip.seats_taken;

                  return (
                    <div key={trip.id} className="activity-card trip-card">
                      <div className="activity-image">
                        <div className="image-placeholder">{getDifficultyIcon(trip.difficulty)}</div>
                      </div>
                      <div className="activity-info">
                        <h3>{trip.title}</h3>
                        <p className="activity-location">{trip.location}</p>
                        <p className="activity-dates">{formatDateRange(trip.start_date, trip.end_date)}</p>
                        <div className="activity-meta">
                          <span className={`badge ${getBadgeClass(trip.difficulty)}`}>
                            {getDifficultyBadge(trip.difficulty)}
                          </span>
                          <span className="seats-left">{seatsLeft} seats left</span>
                        </div>
                        <div className="activity-price">${trip.price}</div>
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleBookTrip(trip)}
                          disabled={seatsLeft <= 0}
                        >
                          {seatsLeft <= 0 ? 'Fully Booked' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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
