const ErrorState = ({ error, navigate }) => {
  return (
    <div className="product-detail-error">
      <h2>Product Not Found</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/shop')} className="btn btn-primary">
        Back to Shop
      </button>
    </div>
  );
};

export default ErrorState;
