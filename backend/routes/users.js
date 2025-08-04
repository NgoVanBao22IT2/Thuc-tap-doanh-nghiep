const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Configure multer for avatar upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Get current user profile
router.get('/me', verifyToken, (req, res) => {
  db.query(
    'SELECT id, name, email, phone, address, avatar, date_of_birth, gender, status, role, email_verified_at, created_at, updated_at FROM users WHERE id = ?',
    [req.user.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });
      res.json(results[0]);
    }
  );
});

// Get all users (Admin only)
router.get('/admin', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    'SELECT id, name, email, phone, address, avatar, role, status, created_at, updated_at FROM users ORDER BY created_at DESC',
    (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.json(results);
    }
  );
});

// Create user (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  const { name, email, phone, role, password, address } = req.body;
  
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if email already exists
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, existing) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      db.query(
        'INSERT INTO users (name, email, password, phone, role, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone || '', role, address || '', 'active'],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Database error' });
          res.status(201).json({ 
            message: 'User created successfully',
            id: result.insertId
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (Admin or own profile)
router.put('/:id', verifyToken, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, phone, address, password, role, date_of_birth, gender } = req.body;
  
  // Check permission
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (date_of_birth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(date_of_birth || null);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }
    // Only admin can update role
    if (role && req.user.role === 'admin') {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.query(query, updateValues, (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User updated successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user role (Admin only)
router.put('/:id/role', verifyToken, verifyAdmin, (req, res) => {
  const { role } = req.body;
  
  if (!['user', 'admin', 'staff'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  db.query(
    'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?',
    [role, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User role updated successfully' });
    }
  );
});

// Update user status (Admin only)
router.put('/:id/status', verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  
  if (!['active', 'inactive', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  db.query(
    'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?',
    [status, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
      res.json({ message: 'User status updated successfully' });
    }
  );
});

// Delete user (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' });
  }

  db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  });
});

// Upload avatar
router.post('/:id/avatar', verifyToken, upload.single('avatar'), (req, res) => {
  const userId = parseInt(req.params.id);
  
  // Check if user can update this profile
  if (req.user.id !== userId && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;

  // Update user avatar in database
  db.query(
    'UPDATE users SET avatar = ?, updated_at = NOW() WHERE id = ?',
    [avatarUrl, userId],
    (err, result) => {
      if (err) {
        // Delete uploaded file if database update fails
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ message: 'User not found' });
      }

      // Return updated user data
      db.query(
        'SELECT id, name, email, phone, address, avatar, date_of_birth, gender, status, role, email_verified_at, created_at, updated_at FROM users WHERE id = ?',
        [userId],
        (err2, userResults) => {
          if (err2) return res.status(500).json({ message: 'Database error' });
          
          res.json({ 
            message: 'Avatar updated successfully',
            avatarUrl: avatarUrl,
            user: userResults[0]
          });
        }
      );
    }
  );
});

module.exports = router;
