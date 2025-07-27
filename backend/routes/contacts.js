const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all contacts (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT * FROM contacts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Create contact (Public)
router.post('/', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  db.query(
    'INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, subject, message],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'Contact submitted successfully', id: result.insertId });
    }
  );
});

// Update contact status (Admin only)
router.put('/:id/status', verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  
  db.query(
    'UPDATE contacts SET status = ? WHERE id = ?',
    [status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
      res.json({ message: 'Contact status updated successfully' });
    }
  );
});

// Reply to contact (Admin only)
router.put('/:id/reply', verifyToken, verifyAdmin, (req, res) => {
  const { admin_reply, status } = req.body;
  
  db.query(
    'UPDATE contacts SET admin_reply = ?, status = ? WHERE id = ?',
    [admin_reply, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
      res.json({ message: 'Reply sent successfully' });
    }
  );
});

module.exports = router;
