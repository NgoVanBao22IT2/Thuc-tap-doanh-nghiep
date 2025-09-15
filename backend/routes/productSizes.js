const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

const router = express.Router();

console.log("ProductSizes router loaded"); // Debug log

// 🔹 Lấy danh sách size theo product_id
router.get("/:productId", verifyToken, verifyAdmin, (req, res) => {
  const { productId } = req.params;
  const query = `
    SELECT ps.id, ps.stock_quantity, s.name 
    FROM product_sizes ps
    JOIN sizes s ON ps.size_id = s.id
    WHERE ps.product_id = ?`;
  db.query(query, [productId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Lỗi khi lấy size sản phẩm" });
    }
    console.log("Product sizes query result:", results); // Debug log
    res.json(results);
  });
});

// 🔹 Thêm size cho sản phẩm
router.post("/", verifyToken, verifyAdmin, (req, res) => {
  console.log("POST /api/product-sizes called");
  console.log("Request body:", req.body);

  const { product_id, size_id, stock_quantity } = req.body;

  if (!product_id || !size_id) {
    return res.status(400).json({ error: "Thiếu product_id hoặc size_id" });
  }

  const query = `INSERT INTO product_sizes (product_id, size_id, stock_quantity) VALUES (?, ?, ?)`;
  db.query(query, [product_id, size_id, stock_quantity || 0], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Lỗi khi thêm size sản phẩm" });
    }
    console.log("Insert result:", result);
    res.json({ id: result.insertId, product_id, size_id, stock_quantity });
  });
});

// 🔹 Cập nhật tồn kho
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { stock_quantity } = req.body;

  const query = `UPDATE product_sizes SET stock_quantity = ? WHERE id = ?`;
  db.query(query, [stock_quantity, id], (err) => {
    if (err) return res.status(500).json({ error: "Lỗi khi cập nhật tồn kho" });
    res.json({ success: true });
  });
});

// 🔹 Xóa size khỏi sản phẩm
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { id } = req.params;
  const query = `DELETE FROM product_sizes WHERE id = ?`;
  db.query(query, [id], (err) => {
    if (err)
      return res.status(500).json({ error: "Lỗi khi xóa size sản phẩm" });
    res.json({ success: true });
  });
});

module.exports = router;
