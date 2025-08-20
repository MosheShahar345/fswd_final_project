const ProductImages = ({ 
  images, 
  selectedImage, 
  setSelectedImage, 
  product, 
  stockStatus 
}) => {
  const currentImage = images[selectedImage];

  return (
    <div className="product-images">
      <div className="main-image">
        <img 
          src={currentImage.url} 
          alt={currentImage.alt || product.name} 
        />
        {stockStatus && (
          <div className={`stock-badge ${stockStatus.class}`}>
            {stockStatus.text}
          </div>
        )}
      </div>
      
      {images.length > 1 && (
        <div className="image-thumbnails">
          {images.map((image, index) => (
            <button
              key={index}
              className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
              onClick={() => setSelectedImage(index)}
            >
              <img 
                src={image.url} 
                alt={image.alt || `${product.name} ${index + 1}`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
