import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/dateUtils.js';
import './AdminCourses.css';

const AdminCourses = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showError('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/courses/admin/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      // Handle API response structure
      setCourses(data.data || data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setShowAddForm(false);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.course-form');
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
    setEditingCourse(null);
    setShowAddForm(true);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.course-form');
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
    setEditingCourse(null);
    setShowAddForm(false);
  };

  const handleSave = async (courseData) => {
    try {
      const url = editingCourse 
        ? `http://localhost:3000/api/courses/${editingCourse.id}`
        : 'http://localhost:3000/api/courses';
      
      const method = editingCourse ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle validation errors more gracefully
        if (errorData.details && Array.isArray(errorData.details)) {
          const errorMessages = errorData.details.map(detail => detail.msg).join(', ');
          throw new Error(errorMessages);
        }
        
        throw new Error(errorData.error?.message || errorData.error || 'Failed to save course');
      }

      await fetchCourses();
      handleCancel();
      showSuccess(editingCourse ? 'Course updated successfully!' : 'Course added successfully!');
    } catch (error) {
      console.error('Error saving course:', error);
      showError(error.message);
    }
  };

  const handleDeleteClick = (course) => {
    setDeletingCourse(course);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCourse) return;

    try {
      const response = await fetch(`http://localhost:3000/api/courses/${deletingCourse.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete course');
      }

      await fetchCourses();
      showSuccess('Course deleted successfully!');
      setDeletingCourse(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      showError(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingCourse(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading courses...</div>;
  }

  return (
    <div className="admin-courses">
      <div className="admin-title">
        <h1>Course Management</h1>
      </div>
      <div className="admin-header">
        <button className="btn btn-secondary" onClick={() => navigate('/admin?tab=content')}>
          ← Back to Admin Dashboard
        </button>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add New Course
        </button>
      </div>

             {(showAddForm || editingCourse) && (
         <CourseForm 
           course={editingCourse}
           onSave={handleSave}
           onCancel={handleCancel}
         />
       )}

       {deletingCourse && (
         <div className="delete-confirmation">
           <div className="confirmation-content">
             <h3>Confirm Deletion</h3>
             <p>Are you sure you want to delete <strong>"{deletingCourse.title}"</strong>?</p>
             <p className="warning-text">This action cannot be undone.</p>
             <div className="confirmation-actions">
               <button 
                 className="btn btn-danger"
                 onClick={handleDeleteConfirm}
               >
                 Delete Course
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

      <div className="courses-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(courses) && courses.length > 0 ? (
              courses.map(course => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.title}</td>
                  <td>{course.level}</td>
                  <td>{course.duration}</td>
                  <td>${course.price}</td>
                  <td>
                    <span className={`status-badge ${course.active ? 'active' : 'inactive'}`}>
                      {course.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(course)}
                      >
                        Edit
                      </button>
                                           <button 
                       className="btn btn-danger btn-sm"
                       onClick={() => handleDeleteClick(course)}
                     >
                       Delete
                     </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  No courses found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Course Form Component
const CourseForm = ({ course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    subtitle: course?.subtitle || '',
    description: course?.description || '',
    level: course?.level || '',
    duration: course?.duration || '',
    price: course?.price || '',
    prerequisites: course?.prerequisites || '',
    max_depth: course?.max_depth || '',
    active: course?.active !== undefined ? course.active : true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields to numbers and boolean fields
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      active: formData.active === 'true' || formData.active === true || formData.active === 1,
      // Convert empty strings to null for optional fields
      subtitle: formData.subtitle.trim() || null,
      duration: formData.duration.trim() || null,
      prerequisites: formData.prerequisites.trim() || null,
      max_depth: formData.max_depth.trim() || null
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
    <div className="course-form">
      <h3>{course ? 'Edit Course' : 'Add New Course'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter course title (3-100 characters)"
            required
          />
          <small className="form-hint">Title must be between 3 and 100 characters</small>
        </div>
        <div className="form-group">
          <label htmlFor="subtitle">Subtitle (Optional)</label>
          <input
            type="text"
            id="subtitle"
            name="subtitle"
            value={formData.subtitle}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter course description (minimum 10 characters)"
            required
          />
          <small className="form-hint">Description must be between 10 and 1000 characters</small>
        </div>
        <div className="form-group">
          <label htmlFor="level">Level</label>
          <select
            id="level"
            name="level"
            value={formData.level}
            onChange={handleChange}
            required
          >
            <option value="">Select Level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="professional">Professional</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="duration">Duration (Optional)</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 3 days, 1 week"
          />
        </div>
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
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prerequisites">Prerequisites (Optional)</label>
            <input
              type="text"
              id="prerequisites"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleChange}
              placeholder="e.g., Open Water certification"
            />
          </div>
          <div className="form-group">
            <label htmlFor="max_depth">Max Depth (Optional)</label>
            <input
              type="text"
              id="max_depth"
              name="max_depth"
              value={formData.max_depth}
              onChange={handleChange}
              placeholder="e.g., 18m, 30m"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="active">Active Status</label>
          <select
            id="active"
            name="active"
            value={formData.active.toString()}
            onChange={handleChange}
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {course ? 'Update Course' : 'Add Course'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCourses;
