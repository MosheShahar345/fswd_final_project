import { Link } from 'react-router-dom';

const HeroSection = ({ heroRef }) => {
  return (
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
  );
};

export default HeroSection;
