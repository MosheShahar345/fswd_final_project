import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';
import { useNavigate } from 'react-router-dom';
import ProductsHeader from '../../components/admin-products/ProductsHeader.jsx';
import ProductsTable from '../../components/admin-products/ProductsTable.jsx';
import ProductForm from '../../components/admin-products/ProductForm.jsx';
import DeleteConfirmation from '../../components/admin-products/DeleteConfirmation.jsx';
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
      <ProductsHeader navigate={navigate} handleAdd={handleAdd} />

      {(showAddForm || editingProduct) && (
        <ProductForm 
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <DeleteConfirmation 
        deletingProduct={deletingProduct}
        handleDeleteConfirm={handleDeleteConfirm}
        handleDeleteCancel={handleDeleteCancel}
      />

      <ProductsTable 
        products={products}
        handleEdit={handleEdit}
        handleDeleteClick={handleDeleteClick}
      />
    </div>
  );
};



export default AdminProducts;
