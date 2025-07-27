const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all products with category and brand info
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, b.name as brand_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.status = 'active'
    ORDER BY p.featured DESC, p.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Get product by ID with full details
router.get('/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  const query = `
    SELECT p.*, c.name as category_name, b.name as brand_name, b.logo as brand_logo
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = ? AND p.status = 'active'
  `;
  
  db.query(query, [productId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (results.length === 0) return res.status(404).json({ message: 'Product not found' });
    
    // Increment view count
    db.query('UPDATE products SET views = views + 1 WHERE id = ?', [productId]);
    
    res.json(results[0]);
  });
});

// Create product (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const {
    name, slug, description, short_description, sku, price, sale_price,
    stock_quantity, category_id, brand_id, weight, featured, image_url, status
  } = req.body;

  // Validate required fields
  if (!name || !price || !stock_quantity || !category_id || !sku) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Chuyển đổi kiểu dữ liệu
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
  const productSku = sku || `SKU-${Date.now()}`;
  const productPrice = parseFloat(price);
  const productSalePrice = sale_price ? parseFloat(sale_price) : null;
  const productStock = parseInt(stock_quantity);
  const productCategory = parseInt(category_id);
  const productBrand = brand_id ? parseInt(brand_id) : null;
  const productWeight = weight ? parseFloat(weight) : null;
  const productFeatured = featured ? 1 : 0;
  const productStatus = status || 'active';

  db.query(
    `INSERT INTO products 
      (name, slug, description, short_description, sku, price, sale_price, stock_quantity, category_id, brand_id, weight, featured, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name, productSlug, description || '', short_description || '', productSku,
      productPrice, productSalePrice, productStock, productCategory, productBrand,
      productWeight, productFeatured, image_url || '', productStatus
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      // Trả về sản phẩm vừa tạo
      db.query(
        `SELECT * FROM products WHERE id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2) return res.status(500).json({ message: 'Database error', error: err2.message });
          res.status(201).json({ message: 'Product created successfully', product: rows[0] });
        }
      );
    }
  );
});

// Update product (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const {
    name, slug, description, short_description, sku, price, sale_price,
    stock_quantity, category_id, brand_id, weight, featured, image_url, status
  } = req.body;

  // Validate required fields
  if (!name || !price || !stock_quantity || !category_id || !sku) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Chuyển đổi kiểu dữ liệu
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-');
  const productPrice = parseFloat(price);
  const productSalePrice = sale_price ? parseFloat(sale_price) : null;
  const productStock = parseInt(stock_quantity);
  const productCategory = parseInt(category_id);
  const productBrand = brand_id ? parseInt(brand_id) : null;
  const productWeight = weight ? parseFloat(weight) : null;
  const productFeatured = featured ? 1 : 0;
  const productStatus = status || 'active';

  db.query(
    `UPDATE products SET 
      name = ?, slug = ?, description = ?, short_description = ?, sku = ?, price = ?, sale_price = ?, stock_quantity = ?, category_id = ?, brand_id = ?, weight = ?, featured = ?, image_url = ?, status = ?
      WHERE id = ?`,
    [
      name, productSlug, description || '', short_description || '', sku,
      productPrice, productSalePrice, productStock, productCategory, productBrand,
      productWeight, productFeatured, image_url || '', productStatus, req.params.id
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found' });
      // Trả về sản phẩm vừa cập nhật
      db.query(
        `SELECT * FROM products WHERE id = ?`,
        [req.params.id],
        (err2, rows) => {
          if (err2) return res.status(500).json({ message: 'Database error', error: err2.message });
          res.json({ message: 'Product updated successfully', product: rows[0] });
        }
      );
    }
  );
});

// Delete product (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  db.query('DELETE FROM products WHERE id = ?', [productId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Product not found or already deleted' });
    res.json({ message: 'Product deleted successfully', id: productId });
  });
});

module.exports = router;


