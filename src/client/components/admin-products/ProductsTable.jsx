import { formatPrice } from '../../utils/productImages.js';

const ProductsTable = ({ products, handleEdit, handleDeleteClick }) => {
  return (
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
  );
};

export default ProductsTable;
