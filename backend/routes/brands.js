const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all brands
router.get('/', (req, res) => {
  db.query('SELECT * FROM brands WHERE status = "active" ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Get all brands (Admin)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  db.query('SELECT * FROM brands ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Create brand (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { name, slug, description, logo, website } = req.body;
  
  db.query(
    'INSERT INTO brands (name, slug, description, logo, website) VALUES (?, ?, ?, ?, ?)',
    [name, slug, description, logo, website],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'Brand created successfully', id: result.insertId });
    }
  );
});

// Update brand (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { name, slug, description, logo, website, status } = req.body;
  
  db.query(
    'UPDATE brands SET name = ?, slug = ?, description = ?, logo = ?, website = ?, status = ? WHERE id = ?',
    [name, slug, description, logo, website, status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Brand not found' });
      res.json({ message: 'Brand updated successfully' });
    }
  );
});

// Delete brand (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM brands WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted successfully' });
  });
});

module.exports = router;
