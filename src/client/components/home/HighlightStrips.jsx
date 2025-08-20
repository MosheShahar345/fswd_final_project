import { Link } from 'react-router-dom';

const HighlightStrips = () => {
  return (
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
          <p className="highlight-description">Learn from expert professionals</p>
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
  );
};

export default HighlightStrips;
