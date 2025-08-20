const AnnouncementTicker = ({ 
  announcements, 
  currentAnnouncement, 
  isTransitioning 
}) => {
  return (
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
  );
};

export default AnnouncementTicker;
