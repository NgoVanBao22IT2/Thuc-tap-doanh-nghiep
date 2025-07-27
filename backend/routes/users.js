const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all users (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT id, name, email, role, phone, address, created_at
    FROM users 
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Update user role (Admin only)
router.put('/:id/role', verifyToken, verifyAdmin, (req, res) => {
  const { role } = req.body;
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  db.query(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User role updated successfully' });
    }
  );
});

// Create user (Admin only)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { name, email, phone, role, password } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  // Hash password
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  db.query(
    'INSERT INTO users (name, email, phone, role, password) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || null, role, hashedPassword],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      res.status(201).json({ message: 'User created successfully', id: result.insertId });
    }
  );
});

// Update user (Admin only)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { name, email, phone, role } = req.body;
  
  if (!name || !email || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }
  
  db.query(
    'UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE id = ?',
    [name, email, phone || null, role, req.params.id],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error' });
      }
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User updated successfully' });
    }
  );
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  // Prevent admin from deleting themselves
  if (req.user.id == req.params.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }
  
  db.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  });
});

module.exports = router;
