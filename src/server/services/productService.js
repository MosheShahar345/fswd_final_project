import { getDb } from '../infra/db.js';

export class ProductService {
  static async getProducts(filters = {}) {
    const db = await getDb();
    
    let query = `
      SELECT p.*, i.qty_on_hand, i.sku
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.active = 1
    `;
    
    const params = [];
    
    // Search filter
    if (filters.q && filters.q.trim()) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${filters.q.trim()}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Brand filter
    if (filters.brand && filters.brand.trim()) {
      query += ' AND p.brand = ?';
      params.push(filters.brand.trim());
    }
    
    // Category filter
    if (filters.category && filters.category.trim()) {
      query += ' AND p.category = ?';
      params.push(filters.category.trim());
    }
    
    // Price range filters
    if (filters.min && !isNaN(parseFloat(filters.min))) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(filters.min));
    }
    
    if (filters.max && !isNaN(parseFloat(filters.max))) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(filters.max));
    }
    
    // Add sorting
    const sortField = filters.sort || 'name';
    const validSortFields = ['name', 'price', 'created_at'];
    if (validSortFields.includes(sortField)) {
      query += ` ORDER BY p.${sortField}`;
      if (sortField === 'price') {
        query += ' ASC'; // Price ascending by default
      }
    }
    
    try {
      const products = await db.all(query, params);
      
      // Get images for each product
      for (const product of products) {
        const images = await db.all(
          'SELECT url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
          [product.id]
        );
        product.images = images;
        
        // Ensure qty_on_hand is a number
        product.qty_on_hand = product.qty_on_hand || 0;
      }
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error('Failed to fetch products');
    }
  }

  static async getProductById(id) {
    const db = await getDb();
    
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid product ID');
    }
    
    try {
      const product = await db.get(`
        SELECT p.*, i.qty_on_hand, i.sku
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.id = ? AND p.active = 1
      `, [parseInt(id)]);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      // Get images
      const images = await db.all(
        'SELECT url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
        [id]
      );
      product.images = images;
      
      // Ensure qty_on_hand is a number
      product.qty_on_hand = product.qty_on_hand || 0;
      
      return product;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  static async createProduct(productData) {
    const db = await getDb();
    
    // Validate required fields
    if (!productData.name || !productData.price) {
      throw new Error('Name and price are required');
    }
    
    if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
      throw new Error('Price must be a positive number');
    }
    
    try {
      const result = await db.run(`
        INSERT INTO products (name, description, brand, category, price, active)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        productData.name.trim(),
        productData.description?.trim() || '',
        productData.brand?.trim() || '',
        productData.category?.trim() || '',
        parseFloat(productData.price),
        productData.active !== undefined ? productData.active : 1
      ]);
      
      return { id: result.lastID, ...productData };
    } catch (error) {
      console.error('Error creating product:', error);
      throw new Error('Failed to create product');
    }
  }

  static async updateProduct(id, productData) {
    const db = await getDb();
    
    if (!id || isNaN(parseInt(id))) {
      throw new Error('Invalid product ID');
    }
    
    const fields = [];
    const values = [];
    
    // Validate and prepare update fields
    if (productData.name !== undefined) {
      fields.push('name = ?');
      values.push(productData.name.trim());
    }
    
    if (productData.description !== undefined) {
      fields.push('description = ?');
      values.push(productData.description.trim());
    }
    
    if (productData.brand !== undefined) {
      fields.push('brand = ?');
      values.push(productData.brand.trim());
    }
    
    if (productData.category !== undefined) {
      fields.push('category = ?');
      values.push(productData.category.trim());
    }
    
    if (productData.price !== undefined) {
      if (isNaN(parseFloat(productData.price)) || parseFloat(productData.price) <= 0) {
        throw new Error('Price must be a positive number');
      }
      fields.push('price = ?');
      values.push(parseFloat(productData.price));
    }
    
    if (productData.active !== undefined) {
      fields.push('active = ?');
      values.push(productData.active ? 1 : 0);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(parseInt(id));
    
    try {
      const result = await db.run(`
        UPDATE products SET ${fields.join(', ')} WHERE id = ?
      `, values);
      
      if (result.changes === 0) {
        throw new Error('Product not found');
      }
      
      return this.getProductById(id);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  static async getCategories() {
    const db = await getDb();
    try {
      const categories = await db.all(
        'SELECT DISTINCT category FROM products WHERE active = 1 AND category IS NOT NULL AND category != "" ORDER BY category'
      );
      return categories.map(c => c.category);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  static async getBrands() {
    const db = await getDb();
    try {
      const brands = await db.all(
        'SELECT DISTINCT brand FROM products WHERE active = 1 AND brand IS NOT NULL AND brand != "" ORDER BY brand'
      );
      return brands.map(b => b.brand);
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new Error('Failed to fetch brands');
    }
  }

  static async getProductStats() {
    const db = await getDb();
    try {
      const stats = await db.get(`
        SELECT 
          COUNT(*) as total_products,
          COUNT(CASE WHEN i.qty_on_hand > 0 THEN 1 END) as in_stock,
          COUNT(CASE WHEN i.qty_on_hand = 0 THEN 1 END) as out_of_stock,
          COUNT(DISTINCT p.category) as categories,
          COUNT(DISTINCT p.brand) as brands,
          MIN(p.price) as min_price,
          MAX(p.price) as max_price,
          AVG(p.price) as avg_price
        FROM products p
        LEFT JOIN inventory i ON p.id = i.product_id
        WHERE p.active = 1
      `);
      
      return {
        total_products: stats?.total_products || 0,
        in_stock: stats?.in_stock || 0,
        out_of_stock: stats?.out_of_stock || 0,
        categories: stats?.categories || 0,
        brands: stats?.brands || 0,
        min_price: stats?.min_price || 0,
        max_price: stats?.max_price || 0,
        avg_price: stats?.avg_price ? Math.round(stats.avg_price * 100) / 100 : 0
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      // Return default stats if there's an error
      return {
        total_products: 0,
        in_stock: 0,
        out_of_stock: 0,
        categories: 0,
        brands: 0,
        min_price: 0,
        max_price: 0,
        avg_price: 0
      };
    }
  }
}
