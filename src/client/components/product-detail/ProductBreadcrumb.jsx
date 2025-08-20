import { Link } from 'react-router-dom';

const ProductBreadcrumb = ({ product }) => {
  return (
    <nav className="breadcrumb">
      <Link to="/shop">Shop</Link>
      <span>/</span>
      {product.category && (
        <>
          <Link to={`/shop?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
        </>
      )}
      <span>{product.name}</span>
    </nav>
  );
};

export default ProductBreadcrumb;
