import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './Activities.css';

const Activities = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'trips');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

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
      </div>

      <div className="activities-content">
        {activeTab === 'trips' ? (
          <div className="trips-section">
            <h2>Upcoming Trips</h2>
            <div className="activities-grid">
              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🏔️</div>
                </div>
                <div className="activity-info">
                  <h3>Rocky Mountain Adventure</h3>
                  <p className="activity-location">Colorado</p>
                  <p className="activity-dates">July 15-20, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-primary">Moderate</span>
                    <span className="seats-left">8 seats left</span>
                  </div>
                  <div className="activity-price">$899.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🏖️</div>
                </div>
                <div className="activity-info">
                  <h3>Coastal Kayaking</h3>
                  <p className="activity-location">California</p>
                  <p className="activity-dates">August 10-12, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-success">Easy</span>
                    <span className="seats-left">5 seats left</span>
                  </div>
                  <div className="activity-price">$299.99</div>
                  <button className="btn btn-primary">Book Now</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="courses-section">
            <h2>Available Courses</h2>
            <div className="activities-grid">
              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🩹</div>
                </div>
                <div className="activity-info">
                  <h3>Wilderness First Aid</h3>
                  <p className="activity-level">Beginner</p>
                  <p className="activity-dates">June 15, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-primary">Beginner</span>
                    <span className="seats-left">15 seats left</span>
                  </div>
                  <div className="activity-price">$199.99</div>
                  <button className="btn btn-primary">Enroll Now</button>
                </div>
              </div>

              <div className="activity-card">
                <div className="activity-image">
                  <div className="image-placeholder">🧗‍♀️</div>
                </div>
                <div className="activity-info">
                  <h3>Advanced Rock Climbing</h3>
                  <p className="activity-level">Advanced</p>
                  <p className="activity-dates">July 1, 2024</p>
                  <div className="activity-meta">
                    <span className="badge badge-warning">Advanced</span>
                    <span className="seats-left">8 seats left</span>
                  </div>
                  <div className="activity-price">$399.99</div>
                  <button className="btn btn-primary">Enroll Now</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;
