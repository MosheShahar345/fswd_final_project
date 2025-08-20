import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
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
  );
};

export default CTASection;
