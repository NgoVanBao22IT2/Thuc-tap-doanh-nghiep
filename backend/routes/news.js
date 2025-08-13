const express = require('express');
const db = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// GET all published news (user)
router.get('/', (req, res) => {
  db.query(
    `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
     FROM news
     WHERE status = 'published'
     ORDER BY created_at DESC, id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      // Trả về tóm tắt (summary) là 200 ký tự đầu của content
      const mapped = results.map(n => ({
        id: n.id,
        title: n.title,
        summary: n.content ? n.content.substring(0, 200) + (n.content.length > 200 ? '...' : '') : '',
        image: n.image,
        category: n.category,
        author: n.author,
        date: n.created_at,
        updated_at: n.updated_at,
        status: n.status
      }));
      res.json(mapped);
    }
  );
});

// GET single news by id (user)
router.get('/:id', (req, res) => {
  db.query(
    `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
     FROM news WHERE id = ? AND status = 'published'`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      if (results.length === 0) return res.status(404).json({ message: 'Not found' });
      const n = results[0];
      res.json({
        id: n.id,
        title: n.title,
        content: n.content,
        image: n.image,
        category: n.category,
        author: n.author,
        date: n.created_at,
        updated_at: n.updated_at,
        status: n.status
      });
    }
  );
});

// GET all news (admin)
router.get('/admin/all', verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
     FROM news
     ORDER BY created_at DESC, id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      res.json(results);
    }
  );
});

// ADD news (admin)
router.post('/', verifyToken, verifyAdmin, (req, res) => {
  const { title, content, image, category, author, status } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Thiếu thông tin' });
  }
  db.query(
    `INSERT INTO news (title, content, image_url, category, author, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [title, content, image || null, category || null, author || null, status || 'draft'],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      db.query(
        `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
         FROM news WHERE id = ?`,
        [result.insertId],
        (err2, results) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
          res.status(201).json(results[0]);
        }
      );
    }
  );
});

// UPDATE news (admin)
router.put('/:id', verifyToken, verifyAdmin, (req, res) => {
  const { title, content, image, category, author, status } = req.body;
  db.query(
    `UPDATE news SET title=?, content=?, image_url=?, category=?, author=?, status=?, updated_at=NOW() WHERE id=?`,
    [title, content, image || null, category || null, author || null, status || 'draft', req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'DB error', error: err });
      db.query(
        `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
         FROM news WHERE id = ?`,
        [req.params.id],
        (err2, results) => {
          if (err2) return res.status(500).json({ message: 'DB error', error: err2 });
          if (results.length === 0) return res.status(404).json({ message: 'Not found' });
          res.json(results[0]);
        }
      );
    }
  );
});

// DELETE news (admin)
router.delete('/:id', verifyToken, verifyAdmin, (req, res) => {
  db.query('DELETE FROM news WHERE id = ?', [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });
    res.json({ message: 'Đã xóa' });
  });
});

module.exports = router;
