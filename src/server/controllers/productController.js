import { ProductService } from '../services/productService.js';

export class ProductController {
  static async getProducts(req, res, next) {
    try {
      const filters = {
        q: req.query.q,
        brand: req.query.brand,
        category: req.query.category,
        min: req.query.min ? parseFloat(req.query.min) : undefined,
        max: req.query.max ? parseFloat(req.query.max) : undefined,
        sort: req.query.sort
      };
      
      const products = await ProductService.getProducts(filters);
      res.json(products);
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const product = await ProductService.getProductById(parseInt(req.params.id));
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(parseInt(req.params.id), req.body);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await ProductService.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  }

  static async getBrands(req, res, next) {
    try {
      const brands = await ProductService.getBrands();
      res.json(brands);
    } catch (error) {
      next(error);
    }
  }
}
