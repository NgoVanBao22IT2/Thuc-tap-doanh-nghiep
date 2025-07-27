const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all coupons (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT * FROM coupons ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Get active coupons (Public)
router.get('/', (req, res) => {
  db.query(
    'SELECT * FROM coupons WHERE status = "active" AND valid_from <= NOW() AND valid_to >= NOW() ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results);
    }
  );
});

// Create coupon (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, user_limit, valid_from, valid_to } = req.body;
  
  db.query(
    'INSERT INTO coupons (code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, user_limit, valid_from, valid_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, user_limit, valid_from, valid_to],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Coupon code already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'Coupon created successfully', id: result.insertId });
    }
  );
});

// Update coupon (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, user_limit, valid_from, valid_to, status } = req.body;
  
  db.query(
    'UPDATE coupons SET code = ?, name = ?, description = ?, type = ?, value = ?, minimum_amount = ?, maximum_discount = ?, usage_limit = ?, user_limit = ?, valid_from = ?, valid_to = ?, status = ? WHERE id = ?',
    [code, name, description, type, value, minimum_amount, maximum_discount, usage_limit, user_limit, valid_from, valid_to, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Coupon not found' });
      res.json({ message: 'Coupon updated successfully' });
    }
  );
});

// Validate coupon
router.post('/validate', (req, res) => {
  const { code, order_amount } = req.body;
  
  db.query(
    'SELECT * FROM coupons WHERE code = ? AND status = "active" AND valid_from <= NOW() AND valid_to >= NOW()',
    [code],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'Invalid or expired coupon' });
      
      const coupon = results[0];
      
      // Check minimum amount
      if (order_amount < coupon.minimum_amount) {
        return res.status(400).json({ 
          message: `Minimum order amount is ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minimum_amount)}` 
        });
      }
      
      // Check usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        return res.status(400).json({ message: 'Coupon usage limit exceeded' });
      }
      
      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (order_amount * coupon.value) / 100;
        if (coupon.maximum_discount && discount > coupon.maximum_discount) {
          discount = coupon.maximum_discount;
        }
      } else {
        discount = coupon.value;
      }
      
      res.json({
        valid: true,
        coupon,
        discount
      });
    }
  );
});

// Delete coupon (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const couponId = parseInt(req.params.id);
  if (isNaN(couponId)) {
    return res.status(400).json({ message: 'Invalid coupon ID' });
  }
  
  db.query('DELETE FROM coupons WHERE id = ?', [couponId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  });
});

module.exports = router;
