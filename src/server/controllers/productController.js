import { ProductService } from '../services/productService.js';
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
const result = await ProductService.getProducts(filters);
const responseTime = Date.now() - startTime;
res.status(200).json(result);
} catch (error) {
const responseTime = Date.now() - startTime;
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
const product = await ProductService.getProductById(productId);
const responseTime = Date.now() - startTime;
res.status(200).json(product);
} catch (error) {
const responseTime = Date.now() - startTime;
if (error.message === 'Product not found') {
throw new NotFoundError('Product');
}
throw error;
}
});
static createProduct = asyncHandler(async (req, res) => {
const startTime = Date.now();
try {
const product = await ProductService.createProduct(req.body);
const responseTime = Date.now() - startTime;
res.status(201).json(product);
} catch (error) {
const responseTime = Date.now() - startTime;
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
const product = await ProductService.updateProduct(productId, req.body);
const responseTime = Date.now() - startTime;
res.status(200).json(product);
} catch (error) {
const responseTime = Date.now() - startTime;
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
const categories = await ProductService.getCategories();
const responseTime = Date.now() - startTime;
res.status(200).json(categories);
} catch (error) {
const responseTime = Date.now() - startTime;
throw new DatabaseError('Failed to fetch categories');
}
});
static getBrands = asyncHandler(async (req, res) => {
const startTime = Date.now();
try {
const brands = await ProductService.getBrands();
const responseTime = Date.now() - startTime;
res.status(200).json(brands);
} catch (error) {
const responseTime = Date.now() - startTime;
throw new DatabaseError('Failed to fetch brands');
}
});
static getProductStats = asyncHandler(async (req, res) => {
const startTime = Date.now();
try {
const stats = await ProductService.getProductStats();
const responseTime = Date.now() - startTime;
res.status(200).json(stats);
} catch (error) {
const responseTime = Date.now() - startTime;
throw new DatabaseError('Failed to fetch product statistics');
}
});
static deleteProduct = asyncHandler(async (req, res) => {
const startTime = Date.now();
const productId = parseInt(req.params.id);
if (!productId || isNaN(productId)) {
throw new ValidationError('Invalid product ID', 'id');
}
try {
await ProductService.deleteProduct(productId);
const responseTime = Date.now() - startTime;
res.status(200).json({
success: true,
message: 'Product deleted successfully'
});
} catch (error) {
const responseTime = Date.now() - startTime;
if (error.message === 'Product not found') {
throw new NotFoundError('Product');
}
throw error;
}
});
}
