const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'newest' } = req.query;
  
  // For now, return empty data to prevent crashes
  res.json({
    reviews: [],
    total: 0,
    page: parseInt(page),
    totalPages: 0,
    summary: {
      total_reviews: 0,
      average_rating: 0,
      five_star: 0,
      four_star: 0,
      three_star: 0,
      two_star: 0,
      one_star: 0
    }
  });
});


// Create review
router.post('/', verifyToken, (req, res) => {
  const { product_id, rating, title, comment, images } = req.body;
  const user_id = req.user.id;
  
  if (!product_id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid data' });
  }
  
  // Check if user already reviewed this product
  db.query(
    'SELECT id FROM reviews WHERE user_id = ? AND product_id = ?',
    [user_id, product_id],
    (err, existing) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
      }
      
      // Get user info
      db.query('SELECT name, email, phone FROM users WHERE id = ?', [user_id], (err, userResult) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (userResult.length === 0) return res.status(404).json({ message: 'User not found' });
        
        const user = userResult[0];
        
        // Check if user has purchased this product
        db.query(
          `SELECT COUNT(*) as count FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           WHERE o.user_id = ? AND oi.product_id = ? AND o.status = 'delivered'`,
          [user_id, product_id],
          (err, purchaseResult) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            
            const verified_purchase = purchaseResult[0].count > 0;
            
            db.query(
              `INSERT INTO reviews (product_id, user_id, rating, name, email, phone, title, comment, images, verified_purchase)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                product_id, user_id, rating, user.name, user.email, user.phone || '',
                title || '', comment || '', images ? JSON.stringify(images) : null, verified_purchase
              ],
              (err, result) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.status(201).json({ 
                  message: 'Đánh giá của bạn đã được gửi và đang chờ duyệt',
                  id: result.insertId 
                });
              }
            );
          }
        );
      });
    }
  );
});

// Vote helpful/unhelpful
router.post('/:id/helpful', verifyToken, (req, res) => {
  const { is_helpful } = req.body;
  const review_id = req.params.id;
  const user_id = req.user.id;
  
  db.query(
    'INSERT INTO review_helpful (review_id, user_id, is_helpful) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE is_helpful = VALUES(is_helpful)',
    [review_id, user_id, is_helpful],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ message: 'Cảm ơn phản hồi của bạn' });
    }
  );
});

// Admin routes
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  const { status = 'all', page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  
  let whereClause = '1=1';
  const params = [];
  
  if (status !== 'all') {
    whereClause += ' AND r.status = ?';
    params.push(status);
  }
  
  const query = `
    SELECT r.*, u.name as user_name, p.name as product_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN products p ON r.product_id = p.id
    WHERE ${whereClause}
    ORDER BY r.created_at DESC
    LIMIT ? OFFSET ?
  `;
  
  params.push(parseInt(limit), offset);
  
  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Update review status (Admin only)
router.put('/:id/status', verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  
  db.query(
    'UPDATE reviews SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Review not found' });
      res.json({ message: 'Cập nhật trạng thái thành công' });
    }
  );
});

// Delete review (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM reviews WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Xóa đánh giá thành công' });
  });
});

module.exports = router;
