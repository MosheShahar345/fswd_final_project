import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatTime } from '../utils/dateUtils.js';
import './CourseCalendar.css';

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [trips, setTrips] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [userTripBookings, setUserTripBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState({});
  const [bookingTrips, setBookingTrips] = useState({});
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [bookingError, setBookingError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Get current month's first and last day
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // Start from Sunday

  // Fetch courses with sessions
  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/calendar');
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch trips
  const fetchTrips = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/trips');
      
      if (!response.ok) {
        console.warn('Failed to fetch trips, continuing with courses only');
        setTrips([]);
        return;
      }
      
      const data = await response.json();
      setTrips(data.data || []);
    } catch (err) {
      console.error('Error fetching trips:', err);
      setTrips([]); // Set empty array so calendar still works
    }
  };

  // Fetch user enrollments and trip bookings
  const fetchUserData = async () => {
    if (!user || !token) return;
    
    try {
      const response = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();

        setUserEnrollments(data.recentEnrollments || []);
        setUserTripBookings(data.recentTripBookings || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // Handle course enrollment
  const handleEnroll = async (courseId, sessionId) => {
    if (!user || !token) {
      setEnrollmentError('Please log in to enroll in courses');
      return;
    }

    setEnrolling(prev => ({ ...prev, [`${courseId}-${sessionId}`]: true }));
    setEnrollmentError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Failed to enroll in course');
      }

      // Navigate to dashboard instead of showing alert
      navigate('/dashboard');
    } catch (err) {
      setEnrollmentError(err.message);
      console.error('Error enrolling in course:', err);
    } finally {
      setEnrolling(prev => ({ ...prev, [`${courseId}-${sessionId}`]: false }));
    }
  };

  // Handle trip booking
  const handleBookTrip = async (tripId) => {
    if (!user || !token) {
      setBookingError('Please log in to book trips');
      return;
    }

    setBookingTrips(prev => ({ ...prev, [tripId]: true }));
    setBookingError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/trips/${tripId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Failed to book trip');
      }

      // Navigate to dashboard instead of showing alert
      navigate('/dashboard');
    } catch (err) {
      setBookingError(err.message);
      console.error('Error booking trip:', err);
    } finally {
      setBookingTrips(prev => ({ ...prev, [tripId]: false }));
    }
  };

  // Check if user is enrolled in a session
  const isEnrolled = (sessionId) => {
    return userEnrollments.some(enrollment => enrollment.session_id === sessionId);
  };

  // Check if user has booked a trip
  const isBooked = (tripId) => {
    return userTripBookings.some(booking => booking.trip_id === tripId);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  // Get events for a specific date (only user's events)
  const getEventsForDate = (date) => {
    const events = [];
    

    
    // Add user's course enrollments
    userEnrollments.forEach(enrollment => {
      const enrollmentDate = new Date(enrollment.session_start);
      const dateString = date.toDateString();
      const enrollmentDateString = enrollmentDate.toDateString();
      
      if (enrollmentDateString === dateString) {
        events.push({
          ...enrollment,
          title: enrollment.course_title,
          type: 'course',
          isEnrolled: true,
          start_at: enrollment.session_start
        });
      }
    });
    
    // Add user's trip bookings
    userTripBookings.forEach(booking => {
      const bookingDate = new Date(booking.start_date);
      const dateString = date.toDateString();
      const bookingDateString = bookingDate.toDateString();
      
      if (bookingDateString === dateString) {
        events.push({
          ...booking,
          title: booking.trip_title,
          type: 'trip',
          isBooked: true,
          seats_taken: booking.seats_taken,
          seats_total: booking.seats_total
        });
      }
    });
    
    // Debug: Add a test event for today if no real events
    if (events.length === 0 && date.toDateString() === new Date().toDateString()) {
      events.push({
        id: 'test',
        course: { title: 'Test Course', price: 99.99 },
        type: 'course',
        isEnrolled: true,
        start_at: new Date().toISOString()
      });
    }
    
    return events;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle day click
  const handleDayClick = (day) => {
    const events = getEventsForDate(day);
    if (events.length > 0) {
      setSelectedDate(day);
      setShowDayModal(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setShowDayModal(false);
    setSelectedDate(null);
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchAllData = async () => {
      try {
        // Fetch courses first (this should work)
        await fetchCourses();
        
        // Try to fetch trips (optional)
        await fetchTrips();
        
        // Fetch user data
        await fetchUserData();
      } catch (err) {
        console.error('Error loading calendar data:', err);
        setError('Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        // Don't set error, just continue with empty data
      }
    }, 3000); // 3 second timeout
    
    fetchAllData();
    
    return () => clearTimeout(timeout);
  }, [user]);

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];



  if (loading) {
    return (
      <div className="course-calendar">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading calendar...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-calendar">
        <div className="error">
          <p>{error}</p>
          <button onClick={() => {
            setError(null);
            setLoading(true);
            fetchCourses();
            fetchTrips();
            fetchUserData();
          }} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-calendar">
      <div className="calendar-header">
        <h2>My Events Calendar</h2>
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} className="btn btn-outline">
            ← Previous
          </button>
          <button onClick={goToToday} className="btn btn-primary">
            Today
          </button>
          <button onClick={goToNextMonth} className="btn btn-outline">
            Next →
          </button>
        </div>
        <div className="current-month">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
      </div>

             {(enrollmentError || bookingError) && (
         <div className="enrollment-error">
           <p>{enrollmentError || bookingError}</p>
           <button onClick={() => { setEnrollmentError(null); setBookingError(null); }} className="btn btn-primary">
             Dismiss
           </button>
         </div>
       )}

      <div className="calendar-grid">
        {/* Day headers */}
        <div className="calendar-day-header">Sun</div>
        <div className="calendar-day-header">Mon</div>
        <div className="calendar-day-header">Tue</div>
        <div className="calendar-day-header">Wed</div>
        <div className="calendar-day-header">Thu</div>
        <div className="calendar-day-header">Fri</div>
        <div className="calendar-day-header">Sat</div>

        {/* Calendar days */}
        {calendarDays.map((day, index) => {
          const events = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          const hasEvents = events.length > 0;

          return (
            <div
              key={index}
              className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''} ${hasEvents ? 'has-events' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className="day-number">{day.getDate()}</div>
                             {hasEvents && (
                 <div className="day-indicators">
                   {events.some(event => event.type === 'course') && (
                     <div className="event-indicator course-indicator" title="My Course Enrollments">🎓</div>
                   )}
                   {events.some(event => event.type === 'trip') && (
                     <div className="event-indicator trip-indicator" title="My Trip Bookings">🏕️</div>
                   )}
                   <div className="event-count">{events.length}</div>
                 </div>
               )}
            </div>
          );
        })}
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color today"></div>
          <span>Today</span>
        </div>
          <div className="legend-item">
            <div className="legend-color has-events"></div>
            <span>Days with Activities</span>
          </div>
                  <div className="legend-item">
            <div className="legend-color regular"></div>
            <span>Days with no Activities</span>
          </div>
      </div>

      {/* Day Details Modal */}
      {showDayModal && selectedDate && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                              <h3>My Events for {formatDate(selectedDate)}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              {getEventsForDate(selectedDate).map((event, index) => (
                <div key={index} className={`event-detail ${event.type}-event`}>
                  {event.type === 'course' ? (
                    // Course session details
                    <>
                      <div className="event-header">
                        <div className="event-icon">🎓</div>
                        <div className="event-title">{event.course.title}</div>
                      </div>
                                             <div className="event-details">
                         <div className="detail-row">
                           <span className="detail-label">Time:</span>
                           <span className="detail-value">{formatTime(event.start_at)}</span>
                         </div>
                         <div className="detail-row">
                           <span className="detail-label">Capacity:</span>
                           <span className="detail-value">{event.enrolled_count}/{event.capacity}</span>
                         </div>
                       </div>
                                             <div className="event-actions">
                         <span className="event-enrolled">✓ Enrolled</span>
                       </div>
                    </>
                  ) : (
                    // Trip details
                    <>
                      <div className="event-header">
                        <div className="event-icon">🏕️</div>
                        <div className="event-title">{event.title}</div>
                      </div>
                                             <div className="event-details">
                         <div className="detail-row">
                           <span className="detail-label">Location:</span>
                           <span className="detail-value">{event.location}</span>
                         </div>
                         <div className="detail-row">
                           <span className="detail-label">Duration:</span>
                           <span className="detail-value">{Math.ceil((new Date(event.end_date) - new Date(event.start_date)) / (1000 * 60 * 60 * 24))} days</span>
                         </div>
                       </div>
                                             <div className="event-actions">
                         <span className="event-booked">✓ Booked</span>
                       </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
