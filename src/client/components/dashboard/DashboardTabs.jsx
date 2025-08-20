import React from 'react';

const DashboardTabs = ({ selectedTab, setSelectedTab, dashboardData }) => {
  return (
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
  );
};

export default DashboardTabs;
