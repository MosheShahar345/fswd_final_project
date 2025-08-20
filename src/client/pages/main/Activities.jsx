import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useCart } from '../../contexts/CartContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import ActivitiesHeader from '../../components/activities/ActivitiesHeader.jsx';
import ActivitiesTabs from '../../components/activities/ActivitiesTabs.jsx';
import TripsSection from '../../components/activities/TripsSection.jsx';
import CoursesSection from '../../components/activities/CoursesSection.jsx';
import EventCalendar from '../../components/calendar/CourseCalendar.jsx';
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
  }, []); // Empty dependency array to run only once

  return (
    <div className="activities">
      <ActivitiesHeader />
      
      <ActivitiesTabs activeTab={activeTab} handleTabChange={handleTabChange} />

      <div className="activities-content">
        {activeTab === 'trips' && (
          <TripsSection trips={trips} handleBookTrip={handleBookTrip} />
        )}

        {activeTab === 'courses' && (
          <CoursesSection 
            courses={courses}
            loading={loading}
            error={error}
            courseStats={courseStats}
            fetchCourses={fetchCourses}
          />
        )}

        {activeTab === 'calendar' && (
          <EventCalendar />
        )}
      </div>
    </div>
  );
};

export default Activities;
