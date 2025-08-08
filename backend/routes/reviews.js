const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'newest', status } = req.query;
  const offset = (page - 1) * limit;

  let orderBy = 'created_at DESC';
  if (sort === 'oldest') orderBy = 'created_at ASC';
  if (sort === 'highest') orderBy = 'rating DESC';
  if (sort === 'lowest') orderBy = 'rating ASC';

  // Xác định điều kiện status
  let statusCondition = '';
  let statusParams = [];
  if (status && status !== 'all') {
    statusCondition = 'AND status = ?';
    statusParams = [status];
  } else if (!status || status === 'approved') {
    statusCondition = 'AND status = ?';
    statusParams = ['approved'];
  }

  // Lấy danh sách review + tổng số review + thống kê rating
  const queryReviews = `
    SELECT * 
    FROM reviews 
    WHERE product_id = ? ${statusCondition}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const queryCount = `
    SELECT 
      COUNT(*) AS total_reviews,
      AVG(rating) AS average_rating,
      SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS five_star,
      SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS four_star,
      SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS three_star,
      SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS two_star,
      SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS one_star
    FROM reviews 
    WHERE product_id = ? ${statusCondition}
  `;

  db.query(queryReviews, [productId, ...statusParams, parseInt(limit), offset], (err, reviews) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    db.query(queryCount, [productId, ...statusParams], (err, stats) => {
      if (err) return res.status(500).json({ message: 'Database error' });

      const total = stats[0].total_reviews || 0;
      const totalPages = Math.ceil(total / limit);

      res.json({
        reviews,
        total,
        page: parseInt(page),
        totalPages,
        summary: {
          total_reviews: total,
          average_rating: parseFloat(stats[0].average_rating || 0).toFixed(1),
          five_star: stats[0].five_star || 0,
          four_star: stats[0].four_star || 0,
          three_star: stats[0].three_star || 0,
          two_star: stats[0].two_star || 0,
          one_star: stats[0].one_star || 0
        }
      });
    });
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
    SELECT r.*, r.comment AS content, u.name as user_name, p.name as product_name
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

// Admin reply to review
router.put('/:id/reply', verifyToken, verifyAdmin, (req, res) => {
  const { admin_reply } = req.body;
  if (!admin_reply || !admin_reply.trim()) {
    return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
  }
  db.query(
    'UPDATE reviews SET admin_reply = ? WHERE id = ?',
    [admin_reply, req.params.id],
    (err, result) => {
      if (err) {
        // Ghi log lỗi chi tiết để debug
        console.error('Error updating admin_reply:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Review not found' });
      res.json({ message: 'Phản hồi thành công' });
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
