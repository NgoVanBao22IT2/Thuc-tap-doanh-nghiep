const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get user orders
router.get('/user', verifyToken, (req, res) => {
  const query = `
    SELECT o.*, 
           GROUP_CONCAT(CONCAT(p.name, ' (x', oi.quantity, ')') SEPARATOR ', ') as items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  db.query(query, [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Get all orders (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           GROUP_CONCAT(CONCAT(p.name, ' (x', oi.quantity, ')') SEPARATOR ', ') as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Create order
router.post('/', verifyToken, (req, res) => {
  const { items, total_amount, shipping_address } = req.body;
  
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: 'Transaction error' });
    
    // Create order
    db.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)',
      [req.user.id, total_amount, shipping_address],
      (err, orderResult) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ message: 'Database error' });
          });
        }
        
        const orderId = orderResult.insertId;
        
        // Insert order items
        const itemQueries = items.map(item => {
          return new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
              [orderId, item.product_id, item.quantity, item.price],
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });
        });
        
        Promise.all(itemQueries)
          .then(() => {
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ message: 'Commit error' });
                });
              }
              res.status(201).json({ message: 'Order created successfully', orderId });
            });
          })
          .catch(() => {
            db.rollback(() => {
              res.status(500).json({ message: 'Order items error' });
            });
          });
      }
    );
  });
});

// Update order status (Admin only)
router.put('/:id/status', verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  
  db.query(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Order not found' });
      res.json({ message: 'Order status updated successfully' });
    }
  );
});

module.exports = router;
