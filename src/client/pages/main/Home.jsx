import { useState, useEffect, useRef } from 'react';
import AnimatedParticles from '../../components/home/AnimatedParticles.jsx';
import HeroSection from '../../components/home/HeroSection.jsx';
import AnnouncementTicker from '../../components/home/AnnouncementTicker.jsx';
import HighlightStrips from '../../components/home/HighlightStrips.jsx';
import CTASection from '../../components/home/CTASection.jsx';
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
      <AnimatedParticles />
      <HeroSection heroRef={heroRef} />
      <AnnouncementTicker 
        announcements={announcements}
        currentAnnouncement={currentAnnouncement}
        isTransitioning={isTransitioning}
      />
      <HighlightStrips />
      <CTASection />
    </div>
  );
};

export default Home;
