import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/productImages.js';
import './AdminProducts.css';

const AdminProducts = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      showError('Access denied. Admin privileges required.');
      navigate('/dashboard');
    }
  }, [user, navigate, showError]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/products');

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      // Products API returns array directly
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddForm(false);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.product-form');
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
    setEditingProduct(null);
    setShowAddForm(true);
    
    // Scroll to form after state update
    setTimeout(() => {
      const formElement = document.querySelector('.product-form');
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
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleSave = async (productData) => {
    try {
      const url = editingProduct 
        ? `http://localhost:3000/api/products/${editingProduct.id}`
        : 'http://localhost:3000/api/products';
      
      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to save product');
      }

      await fetchProducts();
      handleCancel();
      showSuccess(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
    } catch (error) {
      console.error('Error saving product:', error);
      showError(error.message);
    }
  };

  const handleDeleteClick = (product) => {
    setDeletingProduct(product);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    try {
      const response = await fetch(`http://localhost:3000/api/products/${deletingProduct.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete product');
      }

      await fetchProducts();
      showSuccess('Product deleted successfully!');
      setDeletingProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      showError(error.message);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProduct(null);
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-title">
        <h1>Product Management</h1>
      </div>
      <div className="admin-header">
        <div className="header-left">
          <button className="btn btn-secondary" onClick={() => navigate('/admin?tab=content')}>
            ← Back to Admin Dashboard
          </button>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={handleAdd}>
            Add New Product
          </button>
        </div>
      </div>

             {(showAddForm || editingProduct) && (
         <ProductForm 
           product={editingProduct}
           onSave={handleSave}
           onCancel={handleCancel}
         />
       )}

       {deletingProduct && (
         <div className="delete-confirmation">
           <div className="confirmation-content">
             <h3>Confirm Deletion</h3>
             <p>Are you sure you want to delete <strong>"{deletingProduct.name}"</strong>?</p>
             <p className="warning-text">This action cannot be undone.</p>
             <div className="confirmation-actions">
               <button 
                 className="btn btn-danger"
                 onClick={handleDeleteConfirm}
               >
                 Delete Product
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

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(products) && products.length > 0 ? (
              products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.brand}</td>
                <td>{product.category}</td>
                <td>{formatPrice(product.price)}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                                         <button 
                       className="btn btn-danger btn-sm"
                       onClick={() => handleDeleteClick(product)}
                     >
                       Delete
                     </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                No products found
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Product Form Component
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

export default AdminProducts;
