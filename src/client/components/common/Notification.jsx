import { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose, 
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification;
