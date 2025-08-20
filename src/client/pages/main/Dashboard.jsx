import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useSearchParams } from 'react-router-dom';
import DashboardStats from '../../components/dashboard/DashboardStats.jsx';
import DashboardTabs from '../../components/dashboard/DashboardTabs.jsx';
import DashboardOverview from '../../components/dashboard/DashboardOverview.jsx';
import DashboardOrdersTab from '../../components/dashboard/DashboardOrdersTab.jsx';
import DashboardEnrollmentsTab from '../../components/dashboard/DashboardEnrollmentsTab.jsx';
import DashboardTripsTab from '../../components/dashboard/DashboardTripsTab.jsx';
import ProfileSettings from '../../components/common/ProfileSettings.jsx';
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
      <DashboardStats dashboardData={dashboardData} />

      {/* Navigation Tabs */}
      <DashboardTabs 
        selectedTab={selectedTab} 
        setSelectedTab={setSelectedTab} 
        dashboardData={dashboardData} 
      />

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <DashboardOverview 
            dashboardData={dashboardData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
            canCancelEnrollment={canCancelEnrollment}
            handleCancelEnrollment={handleCancelEnrollment}
            cancellingEnrollment={cancellingEnrollment}
          />
        )}

        {/* Orders Tab */}
        {selectedTab === 'orders' && (
          <DashboardOrdersTab 
            dashboardData={dashboardData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
          />
        )}

        {/* Enrollments Tab */}
        {selectedTab === 'enrollments' && (
          <DashboardEnrollmentsTab 
            dashboardData={dashboardData}
            getStatusBadge={getStatusBadge}
            canCancelEnrollment={canCancelEnrollment}
            handleCancelEnrollment={handleCancelEnrollment}
            cancellingEnrollment={cancellingEnrollment}
          />
        )}

        {/* Trips Tab */}
        {selectedTab === 'trips' && (
          <DashboardTripsTab 
            dashboardData={dashboardData}
            getStatusBadge={getStatusBadge}
            formatCurrency={formatCurrency}
          />
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
