import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Main Footer Sections */}
        <div className="footer-sections">
          {/* Company Info */}
          <div className="footer-section">
            <h3 className="footer-title">Ocean Adventures</h3>
            <p className="footer-description">
              Discover the wonders of the underwater world with our premium scuba diving experiences, 
              equipment, and expert guidance.
            </p>
                         <div className="social-links">
               <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                 <i className="fab fa-facebook-f"></i>
               </a>
               <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-link">
                 <svg className="x-icon" viewBox="0 0 24 24" fill="currentColor">
                   <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                 </svg>
               </a>
               <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                 <i className="fab fa-instagram"></i>
               </a>
               <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                 <i className="fab fa-youtube"></i>
               </a>
             </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/shop" className="footer-link">Shop</Link></li>
              <li><Link to="/activities" className="footer-link">Activities</Link></li>
              <li><Link to="/dashboard" className="footer-link">Dashboard</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Services</h4>
            <ul className="footer-links">
              <li><Link to="/activities" className="footer-link">Scuba Diving</Link></li>
              <li><Link to="/activities" className="footer-link">Equipment Rental</Link></li>
              <li><Link to="/activities" className="footer-link">Training Courses</Link></li>
              <li><Link to="/activities" className="footer-link">Guided Tours</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Contact Us</h4>
            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Ocean Drive, Beach City, BC 12345</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>info@oceanadventures.com</span>
              </div>
            </div>
          </div>
        </div>

                 {/* Bottom Footer */}
         <div className="footer-bottom">
           <div className="footer-bottom-content">
             <div className="copyright">
               <p>&copy; {currentYear} Ocean Adventures. All rights reserved.</p>
             </div>
           </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;
