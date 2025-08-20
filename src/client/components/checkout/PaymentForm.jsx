import React from 'react';

const PaymentForm = ({ formData, handleInputChange, errors }) => {
  return (
    <div className="payment-section">
      <h2>Payment Information</h2>
      <div className="form-group">
        <label className="form-label">Card Number *</label>
        <input 
          type="text" 
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleInputChange}
          placeholder="1234 5678 9012 3456"
          className={`form-input ${errors.cardNumber ? 'error' : ''}`}
        />
        {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Expiry Date *</label>
          <input 
            type="text" 
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            placeholder="MM/YY"
            className={`form-input ${errors.expiryDate ? 'error' : ''}`}
          />
          {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">CVV *</label>
          <input 
            type="text" 
            name="cvv"
            value={formData.cvv}
            onChange={handleInputChange}
            placeholder="123"
            className={`form-input ${errors.cvv ? 'error' : ''}`}
          />
          {errors.cvv && <span className="error-message">{errors.cvv}</span>}
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
