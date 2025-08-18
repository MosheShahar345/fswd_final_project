import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [announcements] = useState([
    "🎉 New summer collection now available!",
    "🏕️ Book your camping trip for July - spots filling fast!",
    "🧗‍♀️ Rock climbing course starting next week",
    "🎯 20% off all hiking gear this weekend only!"
  ]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Your Adventure Starts Here</h1>
          <p>Discover premium gear, exciting trips, and expert courses for your next outdoor adventure.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">
              Shop Gear
            </Link>
            <Link to="/activities" className="btn btn-outline">
              Explore Activities
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-placeholder">
            🏔️
          </div>
        </div>
      </section>

      {/* Announcements Ticker */}
      <section className="announcements">
        <div className="announcement-ticker">
          <span className="announcement-icon">📢</span>
          <span className="announcement-text">
            {announcements[currentAnnouncement]}
          </span>
        </div>
      </section>

      {/* Highlight Strips */}
      <section className="highlights">
        <div className="highlight-strip">
          <div className="highlight-content">
            <h2>Featured Products</h2>
            <p>Top-rated gear for your next adventure</p>
            <Link to="/shop" className="btn btn-primary">
              View All
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder">🎒</div>
          </div>
        </div>

        <div className="highlight-strip reverse">
          <div className="highlight-content">
            <h2>Next Trips</h2>
            <p>Join our guided adventures</p>
            <Link to="/activities?tab=trips" className="btn btn-primary">
              Book Now
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder">🏕️</div>
          </div>
        </div>

        <div className="highlight-strip">
          <div className="highlight-content">
            <h2>Next Courses</h2>
            <p>Learn from expert instructors</p>
            <Link to="/activities?tab=courses" className="btn btn-primary">
              Enroll Now
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder">🧗‍♀️</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-grid">
          <div className="cta-card">
            <div className="cta-icon">🛍️</div>
            <h3>Shop Gear</h3>
            <p>Find the perfect equipment for your adventure</p>
            <Link to="/shop" className="btn btn-primary">
              Browse Products
            </Link>
          </div>

          <div className="cta-card">
            <div className="cta-icon">🎯</div>
            <h3>Book Activities</h3>
            <p>Join guided trips and courses</p>
            <Link to="/activities" className="btn btn-primary">
              View Activities
            </Link>
          </div>

          <div className="cta-card">
            <div className="cta-icon">📊</div>
            <h3>Your Dashboard</h3>
            <p>Track orders, bookings, and messages</p>
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
