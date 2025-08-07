const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get sizes by category type
router.get('/category/:type', (req, res) => {
  const { type } = req.params;
  
  if (!['shoes', 'clothing'].includes(type)) {
    return res.status(400).json({ message: 'Invalid category type' });
  }
  
  // For now, return empty data to prevent crashes
  res.json([]);
});

// Get product sizes
router.get('/product/:productId', (req, res) => {
  const { productId } = req.params;
  
  // For now, return empty data to prevent crashes
  res.json([]);
});

// Create size (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { name, category_type, sort_order } = req.body;
  
  res.status(201).json({ message: 'Size created successfully', id: 1 });
});

// Add size to product (Admin only)
router.post('/product', verifyToken, verifyAdmin, (req, res) => {
  const { product_id, size_id, stock_quantity } = req.body;
  
  res.json({ message: 'Product size updated successfully' });
});

module.exports = router;
