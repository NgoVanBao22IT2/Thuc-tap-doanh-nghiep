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

// Gán mã cho user (admin)
router.post('/assign', verifyToken, verifyAdmin, (req, res) => {
  const { coupon_id, user_id } = req.body;
  db.query(
    'INSERT INTO coupon_users (coupon_id, user_id) VALUES (?, ?)',
    [coupon_id, user_id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ success: true });
    }
  );
});

// Lấy danh sách user được gán mã
router.get('/:id/users', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT u.id, u.name, u.email FROM coupon_users cu
     JOIN users u ON cu.user_id = u.id
     WHERE cu.coupon_id = ?`,
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(rows);
    }
  );
});

// Xóa mã khỏi user
router.delete('/assign/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM coupon_users WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ success: true });
  });
});

// Lấy mã giảm giá cho user (chỉ trả về các mã đã gán cho user)
router.get('/available', (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.json([]);
  const query = `
    SELECT c.* FROM coupons c
    JOIN coupon_users cu ON cu.coupon_id = c.id
    WHERE cu.user_id = ?
      AND c.status = 'active'
      AND (c.valid_from IS NULL OR c.valid_from <= NOW())
      AND (c.valid_to IS NULL OR c.valid_to >= NOW())
      AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)
  `;
  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Áp dụng mã giảm giá cho user khi đặt hàng
router.post('/apply', (req, res) => {
  const { code, total_amount, user_id } = req.body;
  if (!code || !user_id) return res.json({ success: false, message: 'Thiếu thông tin' });

  db.query(
    `SELECT c.* FROM coupons c
     JOIN coupon_users cu ON cu.coupon_id = c.id
     WHERE c.code = ? AND cu.user_id = ?`,
    [code, user_id],
    (err, results) => {
      if (err) {
        // Trả về lỗi chi tiết để debug
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (results.length === 0) return res.json({ success: false, message: 'Mã giảm giá không hợp lệ hoặc không được gán cho bạn' });
      
      const coupon = results[0];
      const now = new Date();
      // Kiểm tra trạng thái
      if (coupon.status !== 'active') return res.json({ success: false, message: 'Mã giảm giá đã bị khóa' });
      // Kiểm tra ngày bắt đầu
      if (coupon.valid_from && now < new Date(coupon.valid_from)) return res.json({ success: false, message: 'Mã giảm giá chưa bắt đầu' });
      // Kiểm tra ngày hết hạn
      if (coupon.valid_to && now > new Date(coupon.valid_to)) return res.json({ success: false, message: 'Mã giảm giá đã hết hạn' });
      // Kiểm tra usage limit
      if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) return res.json({ success: false, message: 'Mã giảm giá đã hết lượt sử dụng' });
      // Kiểm tra điều kiện đơn hàng tối thiểu
      if (coupon.minimum_amount && total_amount < coupon.minimum_amount) return res.json({ success: false, message: `Đơn hàng chưa đạt điều kiện sử dụng mã (${coupon.minimum_amount}đ)` });
      // Tính discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round(total_amount * coupon.value / 100);
        if (coupon.maximum_discount && discount > coupon.maximum_discount) discount = coupon.maximum_discount;
      } else {
        discount = coupon.value;
      }
      return res.json({ success: true, discount });
    }
  );
});

module.exports = router;
