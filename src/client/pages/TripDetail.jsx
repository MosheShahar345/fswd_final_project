import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { formatDateRange } from '../utils/dateUtils.js';

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showSuccess, showError } = useNotification();
  
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/trips/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch trip');
        }
        const data = await response.json();
        setTrip(data.data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching trip:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [id]);

  const handleBookTrip = () => {
    if (!trip) return;
    
    try {
      addToCart(trip, 1, 'trip');
      showSuccess(`${trip.title} added to cart!`);
    } catch (error) {
      showError(`Failed to add ${trip.title} to cart: ${error.message}`);
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return '🤿';
      case 'intermediate': return '🌊';
      case 'advanced': return '🏆';
      case 'expert': return '👑';
      default: return '🏕️';
    }
  };



  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="trip-detail">
        <div className="loading">Loading trip details...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="trip-detail">
        <div className="error">
          <p>Error: {error || 'Trip not found'}</p>
          <button onClick={() => navigate('/activities')} className="btn btn-primary">
            Back to Activities
          </button>
        </div>
      </div>
    );
  }

  const seatsLeft = trip.seats_total - trip.seats_taken;
  const duration = calculateDuration(trip.start_date, trip.end_date);

  return (
    <div className="trip-detail">
      <div className="trip-detail-container">
        <div className="trip-images">
          <div className="main-image">
            <div className="image-placeholder">{getDifficultyIcon(trip.difficulty)}</div>
          </div>
        </div>

        <div className="trip-info">
          <h1>{trip.title}</h1>
          <p className="trip-location">{trip.location}</p>
          <div className="trip-price">${trip.price}</div>
          
          <div className="trip-details">
            <h3>Trip Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Dates:</span>
                <span className="detail-value">{formatDateRange(trip.start_date, trip.end_date)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Difficulty:</span>
                <span className="detail-value">{trip.difficulty.charAt(0).toUpperCase() + trip.difficulty.slice(1)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Seats Available:</span>
                <span className="detail-value">{seatsLeft} of {trip.seats_total}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{duration} days</span>
              </div>
            </div>
          </div>

          <div className="trip-description">
            <h3>Description</h3>
            <p>{trip.description || 'Experience an amazing adventure with our guided trip. Details coming soon!'}</p>
          </div>

          <div className="trip-actions">
            <button 
              className="btn btn-primary"
              onClick={handleBookTrip}
              disabled={seatsLeft <= 0}
            >
              {seatsLeft <= 0 ? 'Fully Booked' : 'Book Now'}
            </button>
            <button 
              className="btn btn-outline"
              onClick={() => navigate('/activities')}
            >
              Back to Activities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
