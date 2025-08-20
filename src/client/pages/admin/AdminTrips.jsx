import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatDateRange } from '../../utils/dateUtils.js';
import './AdminTrips.css';

const AdminTrips = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingTrip, setDeletingTrip] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showError('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/trips', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }

      const data = await response.json();
      // Handle API response structure
      setTrips(data.data || data.trips || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      showError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setShowAddForm(false);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.trip-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleAdd = () => {
    setEditingTrip(null);
    setShowAddForm(true);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.trip-form');
      if (formElement) {
        formElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const handleCancel = () => {
    setEditingTrip(null);
    setShowAddForm(false);
  };

  const handleSave = async (tripData) => {
    try {
      const url = editingTrip 
        ? `http://localhost:3000/api/trips/${editingTrip.id}`
        : 'http://localhost:3000/api/trips';
      
      const method = editingTrip ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(tripData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error response:', errorData);
        console.error('Error details:', JSON.stringify(errorData, null, 2));
        
        // Extract the most detailed error message available
        let errorMessage = 'Failed to save trip';
        if (errorData.error) {
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.error.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error.details) {
            errorMessage = errorData.error.details;
          }
        } else if (errorData.details) {
          errorMessage = errorData.details;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        throw new Error(errorMessage);
      }

      await fetchTrips();
      handleCancel();
      showSuccess(editingTrip ? 'Trip updated successfully!' : 'Trip added successfully!');
    } catch (error) {
      console.error('Error saving trip:', error);
      showError(error.message);
    }
  };

  const handleDeleteClick = (trip) => {
    setDeletingTrip(trip);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTrip) return;

    try {
      const response = await fetch(`http://localhost:3000/api/trips/${deletingTrip.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete trip');
      }

      await fetchTrips();
      showSuccess('Trip deleted successfully!');
      setDeletingTrip(null);
    } catch (error) {
      console.error('Error deleting trip:', error);
      showError(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingTrip(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading trips...</div>;
  }

  return (
    <div className="admin-trips">
      <div className="admin-title">
        <h1>Trip Management</h1>
      </div>
      <div className="admin-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin?tab=content')}>
          ← Back to Admin Dashboard
        </button>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add New Trip
        </button>
      </div>

             {(showAddForm || editingTrip) && (
         <TripForm 
           trip={editingTrip}
           onSave={handleSave}
           onCancel={handleCancel}
         />
       )}

       {deletingTrip && (
         <div className="delete-confirmation">
           <div className="confirmation-content">
             <h3>Confirm Deletion</h3>
             <p>Are you sure you want to delete <strong>"{deletingTrip.title}"</strong>?</p>
             <p className="warning-text">This action cannot be undone.</p>
             <div className="confirmation-actions">
               <button 
                 className="btn btn-danger"
                 onClick={handleDeleteConfirm}
               >
                 Delete Trip
               </button>
               <button 
                 className="btn btn-secondary"
                 onClick={handleDeleteCancel}
               >
                 Cancel
               </button>
             </div>
           </div>
         </div>
       )}

      <div className="trips-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Location</th>
              <th>Dates</th>
              <th>Difficulty</th>
              <th>Price</th>
              <th>Seats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(trips) && trips.length > 0 ? (
              trips.map(trip => (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{trip.title}</td>
                  <td>{trip.location}</td>
                  <td>{formatDateRange(trip.start_date, trip.end_date)}</td>
                  <td>{trip.difficulty}</td>
                  <td>${trip.price}</td>
                  <td>{trip.seats_taken || 0}/{trip.seats_total}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(trip)}
                      >
                        Edit
                      </button>
                                           <button 
                       className="btn btn-danger btn-sm"
                       onClick={() => handleDeleteClick(trip)}
                     >
                       Delete
                     </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No trips found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Trip Form Component
const TripForm = ({ trip, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: trip?.title || '',
    description: trip?.description || '',
    location: trip?.location || '',
    start_date: trip?.start_date ? trip.start_date.split('T')[0] : '',
    end_date: trip?.end_date ? trip.end_date.split('T')[0] : '',
    difficulty: trip?.difficulty || '',
    price: trip?.price || '',
    seats_total: trip?.seats_total || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields to numbers
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      seats_total: parseInt(formData.seats_total) || 0
    };
    
    onSave(processedData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="trip-form">
      <h3>{trip ? 'Edit Trip' : 'Add New Trip'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="end_date">End Date</label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleChange}
            required
          >
            <option value="">Select Difficulty</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="seats_total">Total Seats</label>
            <input
              type="number"
              id="seats_total"
              name="seats_total"
              value={formData.seats_total}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {trip ? 'Update Trip' : 'Add Trip'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminTrips;
