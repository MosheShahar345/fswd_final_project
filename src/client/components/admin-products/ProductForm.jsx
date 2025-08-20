import { useState } from 'react';

const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    brand: product?.brand || '',
    category: product?.category || '',
    price: product?.price || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert numeric fields to numbers
    const processedData = {
      ...formData,
      price: parseFloat(formData.price) || 0
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
    <div className="product-form">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
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
          <label htmlFor="brand">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select Category</option>
            <option value="Buoyancy Control Devices">Buoyancy Control Devices</option>
            <option value="Regulators">Regulators</option>
            <option value="Wetsuits">Wetsuits</option>
            <option value="Drysuits">Drysuits</option>
            <option value="Tanks">Tanks</option>
            <option value="Fins">Fins</option>
            <option value="Masks">Masks</option>
            <option value="Snorkels">Snorkels</option>
            <option value="Dive Computers">Dive Computers</option>
            <option value="Accessories">Accessories</option>
            <option value="Weight Systems">Weight Systems</option>
            <option value="Training Equipment">Training Equipment</option>
          </select>
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
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {product ? 'Update Product' : 'Add Product'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
