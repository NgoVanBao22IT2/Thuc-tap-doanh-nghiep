const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// Hàm parse lại blocks từ chuỗi JSON
const parseBlocks = (row) => {
  try {
    return JSON.parse(row.blocks);
  } catch {
    return [];
  }
};

// GET all published news (user)
router.get("/", (req, res) => {
  db.query(
    `SELECT id, title, content, image_url as image, category, author, created_at, updated_at, status
     FROM news
     WHERE status = 'published'
     ORDER BY created_at DESC, id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      // Trả về tóm tắt (summary) là 200 ký tự đầu của content
      const mapped = results.map((n) => ({
        id: n.id,
        title: n.title,
        summary: n.content
          ? n.content.substring(0, 200) + (n.content.length > 200 ? "..." : "")
          : "",
        image: n.image,
        category: n.category,
        author: n.author,
        date: n.created_at,
        updated_at: n.updated_at,
        status: n.status,
      }));
      res.json(mapped);
    }
  );
});

// GET single news by id (user)
router.get("/:id", (req, res) => {
  db.query(
    `SELECT id, title, blocks, content, image_url as image, category, author, created_at, updated_at, status
     FROM news WHERE id = ? AND status = 'published'`,
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      if (results.length === 0)
        return res.status(404).json({ message: "Not found" });
      const n = results[0];
      let blocks = [];
      try {
        blocks = n.blocks ? JSON.parse(n.blocks) : [];
      } catch {
        blocks = [];
      }
      res.json({
        id: n.id,
        title: n.title,
        blocks:
          blocks.length > 0
            ? blocks
            : [
                { type: "text", content: n.content },
                n.image ? { type: "image", src: n.image } : null,
              ].filter(Boolean),
        category: n.category,
        author: n.author,
        date: n.created_at,
        updated_at: n.updated_at,
        status: n.status,
      });
    }
  );
});

// GET all news (admin)
router.get("/admin/all", verifyToken, verifyAdmin, (req, res) => {
  db.query(
    `SELECT id, title, content, image_url, blocks, category, author, created_at, updated_at, status
     FROM news
     ORDER BY created_at DESC, id DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      const mapped = results.map((n) => ({
        ...n,
        blocks: parseBlocks(n),
      }));
      res.json(mapped);
    }
  );
});

// ADD news (admin)
router.post("/", verifyToken, verifyAdmin, (req, res) => {
  const { title, blocks, category, author, status } = req.body;
  if (!title || !blocks || !Array.isArray(blocks) || blocks.length === 0) {
    return res.status(400).json({ message: "Thiếu thông tin" });
  }
  // Lấy mô tả và ảnh từ blocks
  const firstText = blocks.find((b) => b.type === "text")?.content || "";
  const firstImage = blocks.find((b) => b.type === "image")?.src || "";
  db.query(
    `INSERT INTO news (title, content, image_url, blocks, category, author, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      firstText,
      firstImage,
      JSON.stringify(blocks),
      category || null,
      author || null,
      status || "draft",
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      db.query(
        `SELECT id, title, content, image_url as image, blocks, category, author, created_at, updated_at, status
         FROM news WHERE id = ?`,
        [result.insertId],
        (err2, results) => {
          if (err2)
            return res.status(500).json({ message: "DB error", error: err2 });
          res.status(201).json(results[0]);
        }
      );
    }
  );
});

// UPDATE news (admin)
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { title, blocks, category, author, status } = req.body;
  // Lấy mô tả và ảnh từ blocks
  const firstText = blocks.find((b) => b.type === "text")?.content || "";
  const firstImage = blocks.find((b) => b.type === "image")?.src || "";
  db.query(
    `UPDATE news SET title=?, content=?, image_url=?, blocks=?, category=?, author=?, status=?, updated_at=NOW() WHERE id=?`,
    [
      title,
      firstText,
      firstImage,
      JSON.stringify(blocks),
      category || null,
      author || null,
      status || "draft",
      req.params.id,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error", error: err });
      db.query(
        `SELECT id, title, content, image_url as image, blocks, category, author, created_at, updated_at, status
         FROM news WHERE id = ?`,
        [req.params.id],
        (err2, results) => {
          if (err2)
            return res.status(500).json({ message: "DB error", error: err2 });
          if (results.length === 0)
            return res.status(404).json({ message: "Not found" });
          res.json(results[0]);
        }
      );
    }
  );
});

// DELETE news (admin)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  db.query("DELETE FROM news WHERE id = ?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Đã xóa" });
  });
});

module.exports = router;
