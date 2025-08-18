import { useParams } from 'react-router-dom';

const TripDetail = () => {
  const { id } = useParams();

  return (
    <div className="trip-detail">
      <div className="trip-detail-container">
        <div className="trip-images">
          <div className="main-image">
            <div className="image-placeholder">🏔️</div>
          </div>
        </div>

        <div className="trip-info">
          <h1>Rocky Mountain Adventure</h1>
          <p className="trip-location">Colorado</p>
          <div className="trip-price">$899.99</div>
          
          <div className="trip-details">
            <h3>Trip Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Dates:</span>
                <span className="detail-value">July 15-20, 2024</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Difficulty:</span>
                <span className="detail-value">Moderate</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Seats Available:</span>
                <span className="detail-value">8 of 12</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">5 days</span>
              </div>
            </div>
          </div>

          <div className="trip-description">
            <h3>Description</h3>
            <p>Experience the breathtaking beauty of the Rocky Mountains on this 5-day guided adventure. You'll hike through pristine wilderness, camp under the stars, and create memories that will last a lifetime.</p>
          </div>

          <div className="trip-actions">
            <button className="btn btn-primary">Book This Trip</button>
            <button className="btn btn-outline">Join Waitlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
