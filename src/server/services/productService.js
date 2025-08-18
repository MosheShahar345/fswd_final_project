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
    
    if (filters.q) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.brand LIKE ?)';
      const searchTerm = `%${filters.q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (filters.brand) {
      query += ' AND p.brand = ?';
      params.push(filters.brand);
    }
    
    if (filters.category) {
      query += ' AND p.category = ?';
      params.push(filters.category);
    }
    
    if (filters.min) {
      query += ' AND p.price >= ?';
      params.push(filters.min);
    }
    
    if (filters.max) {
      query += ' AND p.price <= ?';
      params.push(filters.max);
    }
    
    // Add sorting
    const sortField = filters.sort || 'name';
    const validSortFields = ['name', 'price', 'created_at'];
    if (validSortFields.includes(sortField)) {
      query += ` ORDER BY p.${sortField}`;
    }
    
    const products = await db.all(query, params);
    
    // Get images for each product
    for (const product of products) {
      const images = await db.all(
        'SELECT url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
        [product.id]
      );
      product.images = images;
    }
    
    return products;
  }

  static async getProductById(id) {
    const db = await getDb();
    
    const product = await db.get(`
      SELECT p.*, i.qty_on_hand, i.sku
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE p.id = ? AND p.active = 1
    `, [id]);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Get images
    const images = await db.all(
      'SELECT url, alt, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC',
      [id]
    );
    product.images = images;
    
    return product;
  }

  static async createProduct(productData) {
    const db = await getDb();
    
    const result = await db.run(`
      INSERT INTO products (name, description, brand, category, price, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [productData.name, productData.description, productData.brand, productData.category, productData.price, productData.active]);
    
    return { id: result.lastID, ...productData };
  }

  static async updateProduct(id, productData) {
    const db = await getDb();
    
    const fields = [];
    const values = [];
    
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(productData[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(id);
    
    const result = await db.run(`
      UPDATE products SET ${fields.join(', ')} WHERE id = ?
    `, values);
    
    if (result.changes === 0) {
      throw new Error('Product not found');
    }
    
    return this.getProductById(id);
  }

  static async getCategories() {
    const db = await getDb();
    const categories = await db.all('SELECT DISTINCT category FROM products WHERE active = 1 AND category IS NOT NULL');
    return categories.map(c => c.category);
  }

  static async getBrands() {
    const db = await getDb();
    const brands = await db.all('SELECT DISTINCT brand FROM products WHERE active = 1 AND brand IS NOT NULL');
    return brands.map(b => b.brand);
  }
}
