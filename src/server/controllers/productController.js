import { ProductService } from '../services/productService.js';
import { logger } from '../utils/logger.js';
import { asyncHandler } from '../middlewares/error.js';
import { NotFoundError, ValidationError, DatabaseError } from '../middlewares/error.js';

export class ProductController {
  static getProducts = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      const filters = {
        q: req.query.q,
        brand: req.query.brand,
        category: req.query.category,
        min: req.query.min ? parseFloat(req.query.min) : undefined,
        max: req.query.max ? parseFloat(req.query.max) : undefined,
        sort: req.query.sort,
        order: req.query.order,
        page: req.query.page,
        limit: req.query.limit,
        inStock: req.query.inStock
      };
      
      logger.info('Fetching products with filters', {
        requestId: req.id,
        userId: req.user?.id || 'anonymous',
        filters,
        ip: req.ip
      });
      
      const result = await ProductService.getProducts(filters);
      
      const responseTime = Date.now() - startTime;
      logger.info('Products fetched successfully', {
        requestId: req.id,
        productCount: result.products?.length || result.length,
        responseTime: `${responseTime}ms`,
        filters
      });
      
      res.status(200).json(result);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch products', {
        requestId: req.id,
        error: error.message,
        responseTime: `${responseTime}ms`,
        filters: req.query
      });
      throw error;
    }
  });

  static getProduct = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const productId = parseInt(req.params.id);
    
    if (!productId || isNaN(productId)) {
      throw new ValidationError('Invalid product ID', 'id');
    }
    
    try {
      logger.info('Fetching product by ID', {
        requestId: req.id,
        productId,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });
      
      const product = await ProductService.getProductById(productId);
      
      const responseTime = Date.now() - startTime;
      logger.info('Product fetched successfully', {
        requestId: req.id,
        productId,
        responseTime: `${responseTime}ms`
      });
      
      res.status(200).json(product);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch product', {
        requestId: req.id,
        productId,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      
      if (error.message === 'Product not found') {
        throw new NotFoundError('Product');
      }
      throw error;
    }
  });

  static createProduct = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      logger.info('Creating new product', {
        requestId: req.id,
        userId: req.user?.id,
        productData: req.body,
        ip: req.ip
      });
      
      const product = await ProductService.createProduct(req.body);
      
      const responseTime = Date.now() - startTime;
      logger.info('Product created successfully', {
        requestId: req.id,
        productId: product.id,
        userId: req.user?.id,
        responseTime: `${responseTime}ms`
      });
      
      res.status(201).json(product);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to create product', {
        requestId: req.id,
        userId: req.user?.id,
        error: error.message,
        responseTime: `${responseTime}ms`,
        productData: req.body
      });
      
      if (error.message.includes('required') || error.message.includes('must be')) {
        throw new ValidationError(error.message);
      }
      throw new DatabaseError('Failed to create product');
    }
  });

  static updateProduct = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    const productId = parseInt(req.params.id);
    
    if (!productId || isNaN(productId)) {
      throw new ValidationError('Invalid product ID', 'id');
    }
    
    try {
      logger.info('Updating product', {
        requestId: req.id,
        productId,
        userId: req.user?.id,
        updateData: req.body,
        ip: req.ip
      });
      
      const product = await ProductService.updateProduct(productId, req.body);
      
      const responseTime = Date.now() - startTime;
      logger.info('Product updated successfully', {
        requestId: req.id,
        productId,
        userId: req.user?.id,
        responseTime: `${responseTime}ms`
      });
      
      res.status(200).json(product);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to update product', {
        requestId: req.id,
        productId,
        userId: req.user?.id,
        error: error.message,
        responseTime: `${responseTime}ms`,
        updateData: req.body
      });
      
      if (error.message === 'Product not found') {
        throw new NotFoundError('Product');
      } else if (error.message === 'Invalid product ID') {
        throw new ValidationError('Invalid product ID', 'id');
      } else if (error.message.includes('must be')) {
        throw new ValidationError(error.message);
      }
      throw new DatabaseError('Failed to update product');
    }
  });

  static getCategories = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      logger.info('Fetching product categories', {
        requestId: req.id,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });
      
      const categories = await ProductService.getCategories();
      
      const responseTime = Date.now() - startTime;
      logger.info('Categories fetched successfully', {
        requestId: req.id,
        categoryCount: categories.length,
        responseTime: `${responseTime}ms`
      });
      
      res.status(200).json(categories);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch categories', {
        requestId: req.id,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw new DatabaseError('Failed to fetch categories');
    }
  });

  static getBrands = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      logger.info('Fetching product brands', {
        requestId: req.id,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });
      
      const brands = await ProductService.getBrands();
      
      const responseTime = Date.now() - startTime;
      logger.info('Brands fetched successfully', {
        requestId: req.id,
        brandCount: brands.length,
        responseTime: `${responseTime}ms`
      });
      
      res.status(200).json(brands);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch brands', {
        requestId: req.id,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw new DatabaseError('Failed to fetch brands');
    }
  });

  static getProductStats = asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      logger.info('Fetching product statistics', {
        requestId: req.id,
        userId: req.user?.id || 'anonymous',
        ip: req.ip
      });
      
      const stats = await ProductService.getProductStats();
      
      const responseTime = Date.now() - startTime;
      logger.info('Product stats fetched successfully', {
        requestId: req.id,
        responseTime: `${responseTime}ms`,
        stats: {
          totalProducts: stats.total_products,
          categories: stats.categories,
          brands: stats.brands
        }
      });
      
      res.status(200).json(stats);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      logger.error('Failed to fetch product stats', {
        requestId: req.id,
        error: error.message,
        responseTime: `${responseTime}ms`
      });
      throw new DatabaseError('Failed to fetch product statistics');
    }
  });
}
