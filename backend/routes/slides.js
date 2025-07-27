const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all active slides (Public)
router.get('/', (req, res) => {
  db.query(
    'SELECT * FROM slides WHERE status = "active" ORDER BY sort_order ASC, created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results);
    }
  );
});

// Get all slides (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    'SELECT * FROM slides ORDER BY sort_order ASC, created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results);
    }
  );
});

// Get slide by ID
router.get('/:id', (req, res) => {
  const slideId = parseInt(req.params.id);
  if (isNaN(slideId)) {
    return res.status(400).json({ message: 'Invalid slide ID' });
  }
  
  db.query(
    'SELECT * FROM slides WHERE id = ?',
    [slideId],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'Slide not found' });
      res.json(results[0]);
    }
  );
});

// Create slide (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { title, description, image, link, button_text, sort_order, status } = req.body;
  
  if (!title || !image) {
    return res.status(400).json({ message: 'Title and image are required' });
  }
  
  db.query(
    'INSERT INTO slides (title, description, image, link, button_text, sort_order, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, description || '', image, link || '', button_text || 'Xem ngay', sort_order || 0, status || 'active'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      res.status(201).json({ 
        message: 'Slide created successfully', 
        id: result.insertId 
      });
    }
  );
});

// Update slide (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { title, description, image, link, button_text, sort_order, status } = req.body;
  
  if (!title || !image) {
    return res.status(400).json({ message: 'Title and image are required' });
  }
  
  db.query(
    'UPDATE slides SET title = ?, description = ?, image = ?, link = ?, button_text = ?, sort_order = ?, status = ? WHERE id = ?',
    [title, description || '', image, link || '', button_text || 'Xem ngay', sort_order || 0, status || 'active', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Slide not found' });
      res.json({ message: 'Slide updated successfully' });
    }
  );
});

// Delete slide (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const slideId = parseInt(req.params.id);
  if (isNaN(slideId)) {
    return res.status(400).json({ message: 'Invalid slide ID' });
  }
  
  db.query(
    'DELETE FROM slides WHERE id = ?',
    [slideId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Slide not found' });
      res.json({ message: 'Slide deleted successfully' });
    }
  );
});

// Update slide order (Admin only)
router.put('/:id/order', verifyToken, verifyAdmin, (req, res) => {
  const { sort_order } = req.body;
  
  if (typeof sort_order !== 'number') {
    return res.status(400).json({ message: 'Sort order must be a number' });
  }
  
  db.query(
    'UPDATE slides SET sort_order = ? WHERE id = ?',
    [sort_order, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Slide not found' });
      res.json({ message: 'Slide order updated successfully' });
    }
  );
});

module.exports = router; 