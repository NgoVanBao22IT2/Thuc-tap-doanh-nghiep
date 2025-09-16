const express = require("express");
const db = require("../config/database");
const { verifyToken } = require("../middleware/auth");
const router = express.Router();

// Lấy giỏ hàng theo user
router.get("/:userId", verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  // Kiểm tra quyền truy cập
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query(
    "SELECT items, updated_at FROM carts WHERE user_id = ?",
    [userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error" });
      if (rows.length === 0) return res.json({ items: [], updated_at: null });

      try {
        const items = JSON.parse(rows[0].items || "[]");
        res.json({
          items,
          updated_at: rows[0].updated_at,
          user_id: userId,
        });
      } catch (parseError) {
        console.error("Error parsing cart items:", parseError);
        res.json({ items: [], updated_at: null });
      }
    }
  );
});

// Lưu giỏ hàng theo user
router.post("/:userId", verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  // Kiểm tra quyền truy cập
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const items = JSON.stringify(req.body.items || []);

  db.query(
    `INSERT INTO carts (user_id, items, updated_at) 
     VALUES (?, ?, NOW()) 
     ON DUPLICATE KEY UPDATE 
     items = VALUES(items), 
     updated_at = NOW()`,

    [userId, items],
    (err, result) => {
      if (err) {
        console.error("Error saving cart:", err);
        return res.status(500).json({ message: "Database error" });
      }

      console.log(
        `Cart saved for user ${userId}: ${JSON.parse(items).length} items`
      );
      res.json({
        success: true,
        message: "Cart saved successfully",
        user_id: userId,
        items_count: JSON.parse(items).length,
      });
    }
  );
});

// Xóa giỏ hàng theo user
router.delete("/:userId", verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  // Kiểm tra quyền truy cập
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  db.query("DELETE FROM carts WHERE user_id = ?", [userId], (err, result) => {
    if (err) {
      console.error("Error deleting cart:", err);
      return res.status(500).json({ message: "Database error" });
    }

    console.log(`Cart deleted for user ${userId}`);
    res.json({
      success: true,
      message: "Cart deleted successfully",
      affected_rows: result.affectedRows,
    });
  });
});

// Sync cart từ localStorage lên server (optional)
router.put("/:userId/sync", verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { items, force_update } = req.body;

  // Nếu force_update = true, ghi đè hoàn toàn
  if (force_update) {
    const itemsJson = JSON.stringify(items || []);

    db.query(
      `INSERT INTO carts (user_id, items, updated_at) 
       VALUES (?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
       items = VALUES(items), 
       updated_at = NOW()`,

      [userId, itemsJson],
      (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ success: true, message: "Cart synced successfully" });
      }
    );
  } else {
    // Logic merge phức tạp hơn (optional implementation)
    res.json({ success: true, message: "Cart sync not implemented yet" });
  }
});

module.exports = router;
