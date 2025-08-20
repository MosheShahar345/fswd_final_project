import React from 'react';
import { formatDateRange } from '../../utils/dateUtils.js';

const TripsSection = ({ trips, handleBookTrip }) => {
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '🐠';
      case 'moderate': return '🪸';
      case 'hard': return '🦈';
      case 'expert': return '🏆';
      default: return '🐠';
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Easy';
      case 'moderate': return 'Moderate';
      case 'hard': return 'Hard';
      case 'expert': return 'Expert';
      default: return difficulty;
    }
  };

  const getBadgeClass = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'badge-success';
      case 'intermediate': return 'badge-primary';
      case 'advanced': return 'badge-warning';
      case 'expert': return 'badge-danger';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="trips-section">
      <h2>Diving Adventures & Marine Expeditions</h2>
      <p className="courses-intro">
        Explore the world's most spectacular diving destinations. 
        From thrilling shark encounters to vibrant coral reefs and blue holes, we offer unforgettable underwater experiences for all skill levels.
      </p>
      <div className="activities-grid">
        {trips.length === 0 ? (
          <div className="no-trips">
            <p>No trips available at the moment.</p>
          </div>
        ) : (
          trips.map((trip) => {
            const seatsLeft = trip.seats_total - trip.seats_taken;

            return (
              <div key={trip.id} className="activity-card trip-card">
                <div className="activity-image">
                  <div className="image-placeholder">{getDifficultyIcon(trip.difficulty)}</div>
                </div>
                <div className="activity-info">
                  <h3>{trip.title}</h3>
                  <p className="activity-location">{trip.location}</p>
                  <p className="activity-dates">{formatDateRange(trip.start_date, trip.end_date)}</p>
                  <div className="activity-meta">
                    <span className={`badge ${getBadgeClass(trip.difficulty)}`}>
                      {getDifficultyBadge(trip.difficulty)}
                    </span>
                    <span className="seats-left">{seatsLeft} seats left</span>
                  </div>
                  <div className="activity-price">${trip.price}</div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleBookTrip(trip)}
                    disabled={seatsLeft <= 0}
                  >
                    {seatsLeft <= 0 ? 'Fully Booked' : 'Book Now'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TripsSection;
