import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
  const [announcements] = useState([
    "🎉 New summer collection now available!",
    "🏕️ Book your camping trip for July - spots filling fast!",
    "🧗‍♀️ Rock climbing course starting next week",
    "🎯 20% off all hiking gear this weekend only!"
  ]);
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentAnnouncement((prev) => (prev + 1) % announcements.length);
        setIsTransitioning(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="home">
      {/* Animated Background Particles */}
      <div className="particles-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            '--delay': `${i * 0.5}s`,
            '--duration': `${3 + i * 0.2}s`,
            '--size': `${10 + i * 2}px`,
            '--opacity': `${0.1 + i * 0.02}`
          }}></div>
        ))}
      </div>

      {/* Hero Section */}
      <section className="hero" ref={heroRef}>
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-title-container">
            <h1 className="hero-title">
              <span className="title-word title-word-1">Your</span>
              <span className="title-word title-word-2">Adventure</span>
              <span className="title-word title-word-3">Starts</span>
              <span className="title-word title-word-4">Here</span>
            </h1>
          </div>
          <p className="hero-description">
            Discover premium gear, exciting trips, and expert courses for your next outdoor adventure.
          </p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary hero-btn">
              <span className="btn-text">Shop Gear</span>
              <span className="btn-icon">→</span>
            </Link>
            <Link to="/activities" className="btn btn-outline hero-btn">
              <span className="btn-text">Explore Activities</span>
              <span className="btn-icon">→</span>
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <div className="hero-placeholder floating">
            <img 
              src="https://i.pinimg.com/1200x/54/b6/96/54b696bf39f0142c086d7d10f8b2284f.jpg" 
              alt="Sea turtle swimming underwater" 
              className="hero-turtle-image"
            />
          </div>
          <div className="hero-glow"></div>
        </div>
      </section>

      {/* Enhanced Announcements Ticker */}
      <section className="announcements">
        <div className="announcement-background"></div>
        <div className="announcement-ticker">
          <span className="announcement-icon">📢</span>
          <div className="announcement-text-container">
            <span 
              className={`announcement-text ${isTransitioning ? 'fade-out' : 'fade-in'}`}
              key={currentAnnouncement}
            >
              {announcements[currentAnnouncement]}
            </span>
          </div>
        </div>
      </section>

      {/* Enhanced Highlight Strips */}
      <section className="highlights">
        <div className="highlight-strip">
          <div className="highlight-content">
            <h2 className="highlight-title">Featured Products</h2>
            <p className="highlight-description">Top-rated gear for your next adventure</p>
            <Link to="/shop" className="btn btn-primary highlight-btn">
              <span>View All</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder bounce">🎒</div>
            <div className="image-glow"></div>
          </div>
        </div>

        <div className="highlight-strip reverse">
          <div className="highlight-content">
            <h2 className="highlight-title">Next Trips</h2>
            <p className="highlight-description">Join our guided adventures</p>
            <Link to="/activities?tab=trips" className="btn btn-primary highlight-btn">
              <span>Book Now</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder bounce">🏕️</div>
            <div className="image-glow"></div>
          </div>
        </div>

        <div className="highlight-strip">
          <div className="highlight-content">
            <h2 className="highlight-title">Next Courses</h2>
            <p className="highlight-description">Learn from expert instructors</p>
            <Link to="/activities?tab=courses" className="btn btn-primary highlight-btn">
              <span>Enroll Now</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>
          <div className="highlight-image">
            <div className="image-placeholder bounce">🧗‍♀️</div>
            <div className="image-glow"></div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="cta-section">
        <div className="cta-background">
          <div className="cta-particles">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="cta-particle" style={{
                '--delay': `${i * 0.3}s`,
                '--duration': `${4 + i * 0.3}s`
              }}></div>
            ))}
          </div>
        </div>
        
        <div className="cta-grid">
          <div className="cta-card">
            <div className="cta-icon-container">
              <div className="cta-icon floating">🛍️</div>
              <div className="icon-glow"></div>
            </div>
            <h3 className="cta-title">Shop Gear</h3>
            <p className="cta-description">Find the perfect equipment for your adventure</p>
            <Link to="/shop" className="btn btn-primary cta-btn">
              <span>Browse Products</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>

          <div className="cta-card">
            <div className="cta-icon-container">
              <div className="cta-icon floating">🎯</div>
              <div className="icon-glow"></div>
            </div>
            <h3 className="cta-title">Book Activities</h3>
            <p className="cta-description">Join guided trips and courses</p>
            <Link to="/activities" className="btn btn-primary cta-btn">
              <span>View Activities</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>

          <div className="cta-card">
            <div className="cta-icon-container">
              <div className="cta-icon floating">📊</div>
              <div className="icon-glow"></div>
            </div>
            <h3 className="cta-title">Your Dashboard</h3>
            <p className="cta-description">Track orders, bookings, and messages</p>
            <Link to="/dashboard" className="btn btn-primary cta-btn">
              <span>Go to Dashboard</span>
              <div className="btn-ripple"></div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
