const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all categories
router.get('/', (req, res) => {
  db.query('SELECT * FROM categories ORDER BY name', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Create category (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { name, description, image } = req.body;
  
  db.query(
    'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
    [name, description, image],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'Category created successfully', id: result.insertId });
    }
  );
});

// Update category (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { name, description, image } = req.body;
  
  db.query(
    'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
    [name, description, image, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
      res.json({ message: 'Category updated successfully' });
    }
  );
});

// Delete category (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  });
});

module.exports = router;
