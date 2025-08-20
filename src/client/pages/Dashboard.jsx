import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { useSearchParams } from 'react-router-dom';
import { formatDate, formatDateRange } from '../utils/dateUtils.js';
import ProfileSettings from '../components/ProfileSettings.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useNotification();
  const [searchParams] = useSearchParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [cancellingEnrollment, setCancellingEnrollment] = useState({});

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Handle tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['overview', 'orders', 'enrollments', 'trips', 'profile'].includes(tabParam)) {
      setSelectedTab(tabParam);
    }
  }, [searchParams]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'pending': 'status-pending',
      'paid': 'status-paid',
      'shipped': 'status-shipped',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled',
      'refunded': 'status-refunded',
      'enrolled': 'status-enrolled',
      'waitlist': 'status-waitlist',
      'dropped': 'status-cancelled',
      'confirmed': 'status-confirmed'
    };

    return (
      <span className={`status-badge ${statusColors[status] || 'status-default'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const canCancelEnrollment = (sessionStart) => {
    const now = new Date();
    const courseStart = new Date(sessionStart);
    const timeDifference = courseStart.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);
    
    // Allow cancellation if course starts more than 24 hours from now
    // (positive hoursDifference means course is in the future)
    return hoursDifference > 24;
  };

  const handleCancelEnrollment = async (enrollmentId, sessionStart) => {
    if (!canCancelEnrollment(sessionStart)) {
      showWarning('Cannot cancel enrollment. Course starts within 24 hours.');
      return;
    }

    setCancellingEnrollment(prev => ({ ...prev, [enrollmentId]: true }));

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3000/api/courses/enrollments/${enrollmentId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || errorData.message || 'Failed to cancel enrollment');
      }

      const result = await response.json();

      // Refresh dashboard data
      fetchDashboardData();
      showSuccess('Enrollment cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling enrollment:', error);
      showError(`Error cancelling enrollment: ${error.message}`);
    } finally {
      setCancellingEnrollment(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      {/* Stats Overview */}
      {dashboardData && (
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.orders.total}</h3>
              <p>Total Orders</p>
              <small>{dashboardData.stats.orders.completed} completed</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.enrollments.total}</h3>
              <p>Course Enrollments</p>
              <small>{dashboardData.stats.enrollments.active} active</small>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{dashboardData.stats.trips.total}</h3>
              <p>Trip Bookings</p>
              <small>{dashboardData.stats.trips.confirmed} confirmed</small>
            </div>
          </div>


        </div>
      )}

             {/* Navigation Tabs */}
       <div className="dashboard-tabs">
         <button 
           className={`btn ${selectedTab === 'overview' ? 'active' : ''}`}
           onClick={() => setSelectedTab('overview')}
         >
           Overview
         </button>
         <button 
           className={`btn ${selectedTab === 'orders' ? 'active' : ''}`}
           onClick={() => setSelectedTab('orders')}
         >
           Orders ({dashboardData?.recentOrders?.length || 0})
         </button>
         <button 
           className={`btn ${selectedTab === 'enrollments' ? 'active' : ''}`}
           onClick={() => setSelectedTab('enrollments')}
         >
           Courses ({dashboardData?.recentEnrollments?.length || 0})
         </button>
                 <button 
          className={`btn ${selectedTab === 'trips' ? 'active' : ''}`}
          onClick={() => setSelectedTab('trips')}
        >
          Trips ({dashboardData?.recentTripBookings?.length || 0})
        </button>
        <button 
          className={`btn ${selectedTab === 'profile' ? 'active' : ''}`}
          onClick={() => setSelectedTab('profile')}
        >
          Profile
        </button>
       </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-section">
              <h2>Recent Orders</h2>
              {dashboardData?.recentOrders?.length > 0 ? (
                <div className="items-grid">
                  {dashboardData.recentOrders.slice(0, 3).map(order => (
                    <div key={order.id} className="item-card">
                      <div className="item-header">
                        <h4>Order #{order.id}</h4>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="item-details">
                        <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                        <p><strong>Items:</strong> {order.item_count}</p>
                        <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No orders yet. Start shopping to see your orders here!</p>
              )}
            </div>

            <div className="overview-section">
              <h2>Recent Course Enrollments</h2>
              {dashboardData?.recentEnrollments?.length > 0 ? (
                <div className="items-grid">
                  {dashboardData.recentEnrollments.slice(0, 3).map(enrollment => (
                    <div key={enrollment.id} className="item-card">
                      <div className="item-header">
                        <h4>{enrollment.course_title}</h4>
                        {getStatusBadge(enrollment.status)}
                      </div>
                      <div className="item-details">
                        <p><strong>Course:</strong> {enrollment.course_title}</p>
                        <p><strong>Start Date:</strong> {formatDate(enrollment.start_at)}</p>
                        {enrollment.status === 'enrolled' && canCancelEnrollment(enrollment.session_start) && (
                          <div className="enrollment-actions">
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelEnrollment(enrollment.id, enrollment.session_start)}
                              disabled={cancellingEnrollment[enrollment.id]}
                            >
                              {cancellingEnrollment[enrollment.id] ? 'Cancelling...' : 'Cancel Enrollment'}
                            </button>
                          </div>
                        )}
                        {enrollment.status === 'enrolled' && !canCancelEnrollment(enrollment.session_start) && (
                          <div className="enrollment-notice">
                            <small className="text-muted">Cannot cancel - course starts within 24 hours</small>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No course enrollments yet. Browse our courses to get started!</p>
              )}
            </div>

            <div className="overview-section">
              <h2>Recent Trip Bookings</h2>
              {dashboardData?.recentTripBookings?.length > 0 ? (
                <div className="items-grid">
                  {dashboardData.recentTripBookings.slice(0, 3).map(booking => (
                    <div key={booking.id} className="item-card">
                      <div className="item-header">
                        <h4>{booking.trip_title}</h4>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="item-details">
                        <p><strong>Location:</strong> {booking.location}</p>
                        <p><strong>Dates:</strong> {formatDateRange(booking.start_date, booking.end_date)}</p>
                        <p><strong>Paid:</strong> {formatCurrency(booking.paid_amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-items">No trip bookings yet. Explore our adventure trips!</p>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <div className="orders-content">
            <h2>My Orders</h2>
            {dashboardData?.recentOrders?.length > 0 ? (
              <div className="items-list">
                {dashboardData.recentOrders.map(order => (
                  <div key={order.id} className="item-card">
                    <div className="item-header">
                      <h4>Order #{order.id}</h4>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="item-details">
                      <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      <p><strong>Items:</strong> {order.item_count}</p>
                      <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">No orders yet. Start shopping to see your orders here!</p>
            )}
          </div>
        )}

        {/* Enrollments Tab */}
        {selectedTab === 'enrollments' && (
          <div className="enrollments-content">
            <h2>My Course Enrollments</h2>
            {dashboardData?.recentEnrollments?.length > 0 ? (
              <div className="items-list">
                {dashboardData.recentEnrollments.map(enrollment => (
                  <div key={enrollment.id} className="item-card">
                    <div className="item-header">
                      <h4>{enrollment.course_title}</h4>
                      {getStatusBadge(enrollment.status)}
                    </div>
                    <div className="item-details">
                      <p><strong>Course:</strong> {enrollment.course_title}</p>
                      <p><strong>Start Date:</strong> {formatDate(enrollment.start_at)}</p>
                      <p><strong>Enrolled:</strong> {formatDate(enrollment.created_at)}</p>
                      {enrollment.status === 'enrolled' && canCancelEnrollment(enrollment.session_start) && (
                        <div className="enrollment-actions">
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleCancelEnrollment(enrollment.id, enrollment.session_start)}
                            disabled={cancellingEnrollment[enrollment.id]}
                          >
                            {cancellingEnrollment[enrollment.id] ? 'Cancelling...' : 'Cancel Enrollment'}
                          </button>
                        </div>
                      )}
                      {enrollment.status === 'enrolled' && !canCancelEnrollment(enrollment.session_start) && (
                        <div className="enrollment-notice">
                          <small className="text-muted">Cannot cancel - course starts within 24 hours</small>
                        </div>
                      )}
                      {enrollment.status === 'cancelled' && (
                        <div className="enrollment-notice">
                          <small className="text-muted">Enrollment cancelled</small>
                        </div>
                      )}
                      {enrollment.status === 'cancelled' && (
                        <div className="enrollment-notice">
                          <small className="text-muted">Enrollment cancelled</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">No course enrollments yet. Browse our courses to get started!</p>
            )}
          </div>
        )}

        {/* Trips Tab */}
        {selectedTab === 'trips' && (
          <div className="trips-content">
            <h2>My Trip Bookings</h2>
            {dashboardData?.recentTripBookings?.length > 0 ? (
              <div className="items-list">
                {dashboardData.recentTripBookings.map(booking => (
                  <div key={booking.id} className="item-card">
                    <div className="item-header">
                      <h4>{booking.trip_title}</h4>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="item-details">
                      <p><strong>Location:</strong> {booking.location}</p>
                      <p><strong>Difficulty:</strong> {booking.difficulty}</p>
                      <p><strong>Dates:</strong> {formatDateRange(booking.start_date, booking.end_date)}</p>
                      <p><strong>Paid Amount:</strong> {formatCurrency(booking.paid_amount)}</p>
                      <p><strong>Booked:</strong> {formatDate(booking.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-items">No trip bookings yet. Explore our adventure trips!</p>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {selectedTab === 'profile' && (
          <div className="profile-content">
            <ProfileSettings />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
