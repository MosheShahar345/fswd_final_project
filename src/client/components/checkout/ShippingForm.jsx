import React from 'react';

const ShippingForm = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="checkout-form">
      <h2>Shipping Information</h2>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">First Name *</label>
          <input 
            type="text" 
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className={`form-input ${errors.firstName ? 'error' : ''}`}
          />
          {errors.firstName && <span className="error-message">{errors.firstName}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Last Name *</label>
          <input 
            type="text" 
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className={`form-input ${errors.lastName ? 'error' : ''}`}
          />
          {errors.lastName && <span className="error-message">{errors.lastName}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Email *</label>
        <input 
          type="email" 
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label className="form-label">Address *</label>
        <input 
          type="text" 
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={`form-input ${errors.address ? 'error' : ''}`}
        />
        {errors.address && <span className="error-message">{errors.address}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City *</label>
          <input 
            type="text" 
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`form-input ${errors.city ? 'error' : ''}`}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">State *</label>
          <input 
            type="text" 
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className={`form-input ${errors.state ? 'error' : ''}`}
          />
          {errors.state && <span className="error-message">{errors.state}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">ZIP Code *</label>
          <input 
            type="text" 
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className={`form-input ${errors.zipCode ? 'error' : ''}`}
          />
          {errors.zipCode && <span className="error-message">{errors.zipCode}</span>}
        </div>
      </div>
    </div>
  );
};

export default ShippingForm;
