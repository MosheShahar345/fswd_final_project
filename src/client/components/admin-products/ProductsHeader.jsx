const ProductsHeader = ({ navigate, handleAdd }) => {
  return (
    <>
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
    </>
  );
};

export default ProductsHeader;
