const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

/**
 * =============================
 * CRUD cho bảng sizes
 * =============================
 */

// Lấy tất cả sizes
router.get("/", (req, res) => {
  const query = "SELECT * FROM sizes ORDER BY sort_order, name";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Lỗi query sizes:", err);
      return res.status(500).json({ error: "Lỗi tải danh sách size!" });
    }
    res.json(results);
  });
});

// Thêm size mới
router.post("/", verifyToken, verifyAdmin, (req, res) => {
  console.log("POST /api/sizes called");
  console.log("User from token:", req.user);
  console.log("Request body:", req.body);

  const { name, category_type, sort_order, description, status } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Tên size không được để trống!" });
  }

  const query =
    "INSERT INTO sizes (name, category_type, sort_order, description, status) VALUES (?, ?, ?, ?, ?)";
  const values = [
    name.trim(),
    category_type || "shoes",
    parseInt(sort_order) || 0,
    description || "",
    parseInt(status) || 1,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Lỗi insert size:", err);
      return res.status(500).json({ error: "Lỗi khi lưu size!" });
    }
    res.json({ id: result.insertId, message: "Thêm size thành công!" });
  });
});

// Cập nhật size
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const { name, category_type, sort_order, description, status } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Tên size không được để trống!" });
  }

  const query =
    "UPDATE sizes SET name=?, category_type=?, sort_order=?, description=?, status=? WHERE id=?";
  const values = [
    name.trim(),
    category_type || "shoes",
    parseInt(sort_order) || 0,
    description || "",
    parseInt(status) || 1,
    req.params.id,
  ];

  db.query(query, values, (err) => {
    if (err) {
      console.error("Lỗi update size:", err);
      return res.status(500).json({ error: "Lỗi khi cập nhật size!" });
    }
    res.json({ message: "Cập nhật size thành công!" });
  });
});

// Xóa size
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const query = "DELETE FROM sizes WHERE id=?";
  db.query(query, [req.params.id], (err) => {
    if (err) {
      console.error("Lỗi delete size:", err);
      return res.status(500).json({ error: "Lỗi khi xóa size!" });
    }
    res.json({ message: "Xóa size thành công!" });
  });
});

/**
 * =============================
 * Quản lý product_sizes (liên kết sản phẩm - size)
 * =============================
 */

// Lấy danh sách size + tồn kho theo product
router.get("/product/:productId", (req, res) => {
  const query = `SELECT ps.id, s.id as size_id, s.name as size_name, ps.quantity
       FROM product_sizes ps
       JOIN sizes s ON ps.size_id = s.id
       WHERE ps.product_id=?`;
  db.query(query, [req.params.productId], (err, results) => {
    if (err) {
      console.error("Lỗi query product_sizes:", err);
      return res
        .status(500)
        .json({ error: "Lỗi tải danh sách size theo sản phẩm!" });
    }
    res.json(results);
  });
});

// Thêm/ cập nhật size cho product
router.post("/product/:productId", verifyToken, verifyAdmin, (req, res) => {
  const { size_id, quantity } = req.body;

  // Kiểm tra đã tồn tại chưa
  const queryCheck =
    "SELECT id FROM product_sizes WHERE product_id=? AND size_id=?";
  db.query(queryCheck, [req.params.productId, size_id], (err, exist) => {
    if (err) {
      console.error("Lỗi kiểm tra tồn tại size:", err);
      return res.status(500).json({ error: "Lỗi khi kiểm tra size tồn tại!" });
    }

    if (exist.length > 0) {
      // Update số lượng nếu đã tồn tại
      const queryUpdate = "UPDATE product_sizes SET quantity=? WHERE id=?";
      db.query(queryUpdate, [quantity, exist[0].id], (err) => {
        if (err) {
          console.error("Lỗi update size sản phẩm:", err);
          return res
            .status(500)
            .json({ error: "Lỗi khi cập nhật size cho sản phẩm!" });
        }
        res.json({ message: "Cập nhật size cho sản phẩm thành công!" });
      });
    } else {
      // Thêm mới
      const queryInsert =
        "INSERT INTO product_sizes (product_id, size_id, quantity) VALUES (?, ?, ?)";
      db.query(
        queryInsert,
        [req.params.productId, size_id, quantity || 0],
        (err) => {
          if (err) {
            console.error("Lỗi thêm mới size sản phẩm:", err);
            return res
              .status(500)
              .json({ error: "Lỗi khi lưu size cho sản phẩm!" });
          }
          res.json({ message: "Thêm size cho sản phẩm thành công!" });
        }
      );
    }
  });
});

// Xóa size của product
router.delete(
  "/product/:productSizeId",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    const query = "DELETE FROM product_sizes WHERE id=?";
    db.query(query, [req.params.productSizeId], (err) => {
      if (err) {
        console.error("Lỗi delete size sản phẩm:", err);
        return res
          .status(500)
          .json({ error: "Lỗi khi xóa size khỏi sản phẩm!" });
      }
      res.json({ message: "Xóa size của sản phẩm thành công!" });
    });
  }
);

module.exports = router;
