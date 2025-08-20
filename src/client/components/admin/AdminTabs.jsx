import React from 'react';

const AdminTabs = ({ selectedTab, setSelectedTab, adminData }) => {
  return (
    <div className="admin-tabs">
      <button 
        className={`btn ${selectedTab === 'overview' ? 'active' : ''}`}
        onClick={() => setSelectedTab('overview')}
      >
        Overview
      </button>
      <button 
        className={`btn ${selectedTab === 'users' ? 'active' : ''}`}
        onClick={() => setSelectedTab('users')}
      >
        User Management ({adminData?.recentUsers?.length || 0})
      </button>
      <button 
        className={`btn ${selectedTab === 'content' ? 'active' : ''}`}
        onClick={() => setSelectedTab('content')}
      >
        Content Management
      </button>
      <button 
        className={`btn ${selectedTab === 'orders' ? 'active' : ''}`}
        onClick={() => setSelectedTab('orders')}
      >
        Orders ({adminData?.allOrders?.length || 0})
      </button>
      <button 
        className={`btn ${selectedTab === 'refunds' ? 'active' : ''}`}
        onClick={() => setSelectedTab('refunds')}
      >
        Refunds ({adminData?.pendingRefunds?.length || 0})
      </button>
      <button 
        className={`btn ${selectedTab === 'analytics' ? 'active' : ''}`}
        onClick={() => setSelectedTab('analytics')}
      >
        Analytics
      </button>
    </div>
  );
};

export default AdminTabs;
