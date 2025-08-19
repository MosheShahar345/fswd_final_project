import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);



  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showError('File size must be less than 5MB');
      return;
    }

    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile/picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user data to get the latest profile picture
        await refreshUser();
        showSuccess('Profile picture updated successfully!');
      } else {
        showError(data.message || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      showError('Failed to upload profile picture. Please try again.');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.profilePicture) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/profile/picture', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Refresh user data to get the latest profile picture
        await refreshUser();
        showSuccess('Profile picture removed successfully!');
      } else {
        showError(data.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Profile picture delete error:', error);
      showError('Failed to remove profile picture. Please try again.');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-settings">
      <div className="profile-settings-header">
        <h3>Profile Settings</h3>
        <p>Manage your profile picture and account settings</p>
      </div>

      <div className="profile-picture-section">
        <div className="current-picture">
          {user?.profilePicture ? (
            <img 
              src={`http://localhost:3000/uploads/profiles/${user.profilePicture}`}
              alt={`${user.name}'s profile`}
              className="profile-picture-large"
              onError={(e) => {
                console.error('Failed to load profile picture:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="profile-placeholder-large" style={{ display: user?.profilePicture ? 'none' : 'flex' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        </div>

        <div className="profile-picture-actions">
          <button 
            onClick={triggerFileInput}
            disabled={uploading}
            className="btn btn-primary"
          >
            {uploading ? 'Uploading...' : user?.profilePicture ? 'Change Picture' : 'Upload Picture'}
          </button>
          
          {user?.profilePicture && (
            <button 
              onClick={handleDeleteProfilePicture}
              className="btn btn-outline btn-danger"
            >
              Remove Picture
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="file-input-hidden"
        />

        <div className="upload-info">
          <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem' }}>
            📋 Upload Requirements
          </h4>
          <ul className="upload-requirements">
            <li><strong>Supported formats:</strong> JPEG, PNG, WebP</li>
            <li><strong>Maximum file size:</strong> 5MB</li>
            <li><strong>Recommended size:</strong> 400x400 pixels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
