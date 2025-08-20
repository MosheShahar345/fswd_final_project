const DeleteConfirmation = ({ 
  deletingProduct, 
  handleDeleteConfirm, 
  handleDeleteCancel 
}) => {
  if (!deletingProduct) return null;

  return (
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
  );
};

export default DeleteConfirmation;
