const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all settings
router.get('/', (req, res) => {
  db.query('SELECT * FROM settings ORDER BY key_name', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(results);
  });
});

// Update settings (Admin only)
router.put('/', verifyToken, verifyAdmin, (req, res) => {
  const settings = req.body;
  
  const updatePromises = Object.keys(settings).map(key => {
    return new Promise((resolve, reject) => {
      db.query(
        'INSERT INTO settings (key_name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = ?',
        [key, settings[key], settings[key]],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  });
  
  Promise.all(updatePromises)
    .then(() => {
      res.json({ message: 'Settings updated successfully' });
    })
    .catch(error => {
      console.error('Error updating settings:', error);
      res.status(500).json({ message: 'Database error' });
    });
});

module.exports = router;
