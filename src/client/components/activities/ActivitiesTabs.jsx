import React from 'react';

const ActivitiesTabs = ({ activeTab, handleTabChange }) => {
  return (
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
  );
};

export default ActivitiesTabs;
