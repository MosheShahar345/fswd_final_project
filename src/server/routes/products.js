import express from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { createProductSchema, updateProductSchema } from '../validators/products.js';

const router = express.Router();

// Validation middleware
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors[0].message });
  }
};

// Public routes
router.get('/', ProductController.getProducts);
router.get('/categories', ProductController.getCategories);
router.get('/brands', ProductController.getBrands);
router.get('/:id', ProductController.getProduct);

// Protected routes (manager/admin only)
router.post('/', authenticateToken, requireRole(['manager', 'admin']), validate(createProductSchema), ProductController.createProduct);
router.patch('/:id', authenticateToken, requireRole(['manager', 'admin']), validate(updateProductSchema), ProductController.updateProduct);

export default router;
