const express = require('express');
const db = require('../config/database');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Lấy giỏ hàng theo user
router.get('/:userId', verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);
  db.query('SELECT items FROM carts WHERE user_id = ?', [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (rows.length === 0) return res.json({ items: [] });
    res.json({ items: JSON.parse(rows[0].items) });
  });
});

// Lưu giỏ hàng theo user
router.post('/:userId', verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);
  const items = JSON.stringify(req.body.items || []);
  db.query(
    'INSERT INTO carts (user_id, items) VALUES (?, ?) ON DUPLICATE KEY UPDATE items = VALUES(items)',
    [userId, items],
    (err) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json({ success: true });
    }
  );
});

module.exports = router;
