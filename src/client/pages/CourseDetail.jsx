import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const { id } = useParams();

  return (
    <div className="course-detail">
      <div className="course-detail-container">
        <div className="course-images">
          <div className="main-image">
            <div className="image-placeholder">🧗‍♀️</div>
          </div>
        </div>

        <div className="course-info">
          <h1>Advanced Rock Climbing</h1>
          <p className="course-level">Advanced Level</p>
          <div className="course-price">$399.99</div>
          
          <div className="course-details">
            <h3>Course Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Start Date:</span>
                <span className="detail-value">July 1, 2024</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Level:</span>
                <span className="detail-value">Advanced</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Seats Available:</span>
                <span className="detail-value">8 of 12</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">8 weeks</span>
              </div>
            </div>
          </div>

          <div className="course-description">
            <h3>Description</h3>
            <p>Master advanced climbing techniques and safety protocols in this comprehensive course. Learn from expert instructors and develop the skills needed for challenging climbs.</p>
          </div>

          <div className="course-syllabus">
            <h3>Course Syllabus</h3>
            <ul>
              <li>Advanced belaying techniques</li>
              <li>Lead climbing fundamentals</li>
              <li>Safety equipment and protocols</li>
              <li>Route planning and navigation</li>
              <li>Emergency procedures</li>
            </ul>
          </div>

          <div className="course-actions">
            <button className="btn btn-primary">Enroll Now</button>
            <button className="btn btn-outline">Join Waitlist</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
