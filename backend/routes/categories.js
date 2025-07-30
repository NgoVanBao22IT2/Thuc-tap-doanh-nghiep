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
  const { name, slug, description, image, status } = req.body;
  // Nếu không có status thì mặc định là 'active'
  const categoryStatus = status || 'active';
  db.query(
    'INSERT INTO categories (name, slug, description, image, status) VALUES (?, ?, ?, ?, ?)',
    [name, slug, description, image, categoryStatus],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.status(201).json({ message: 'Category created successfully', id: result.insertId });
    }
  );
});

// Update category (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { name, description, image, parent_id, slug, status } = req.body;

  db.query(
    'UPDATE categories SET name = ?, description = ?, image = ?, parent_id = ?, slug = ?, status = ? WHERE id = ?',
    [name, description, image, parent_id || null, slug, status || 'active', req.params.id],
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

// Get children categories by parent_id
router.get('/:id/children', (req, res) => {
  db.query('SELECT * FROM categories WHERE parent_id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

module.exports = router;
