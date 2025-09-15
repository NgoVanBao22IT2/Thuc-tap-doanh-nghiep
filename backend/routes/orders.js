const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// Get user orders
router.get("/user/:userId", verifyToken, (req, res) => {
  const userId = parseInt(req.params.userId);

  // Check if user can access these orders
  if (req.user.id !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           GROUP_CONCAT(
             CONCAT(p.name, 
               CASE WHEN oi.size_name IS NOT NULL 
                    THEN CONCAT(' (Size: ', oi.size_name, ')') 
                    ELSE '' 
               END,
               ' (x', oi.quantity, ')'
             ) SEPARATOR ', '
           ) as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Get all orders (Admin only)
router.get("/admin", verifyToken, verifyAdmin, (req, res) => {
  const query = `
    SELECT o.*, u.name as user_name, u.email as user_email,
           COALESCE(o.status, 'pending') as status,
           GROUP_CONCAT(
             CONCAT(p.name, 
               CASE WHEN oi.size_name IS NOT NULL 
                    THEN CONCAT(' (Size: ', oi.size_name, ')') 
                    ELSE '' 
               END,
               ' (x', oi.quantity, ')'
             ) SEPARATOR ', '
           ) as items
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN products p ON oi.product_id = p.id
    GROUP BY o.id, o.status, o.user_id, o.total_amount, o.created_at, o.shipping_address, o.customer_phone, o.coupon_code, o.shipping_fee, u.name, u.email
    ORDER BY o.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Debug log để kiểm tra dữ liệu trả về
    console.log("Admin orders query results:", results);
    res.json(results);
  });
});

// Create order
router.post("/", (req, res) => {
  const {
    items,
    total_amount,
    shipping_address,
    shipping_fee,
    customer_phone,
    payment_method,
    coupon_code,
    discount_amount,
    user_id,
    coupon_id,
  } = req.body;

  if (!user_id || !items || !shipping_address || !customer_phone) {
    return res
      .status(400)
      .json({ success: false, message: "Thiếu thông tin đơn hàng" });
  }

  // Tạo mã đơn hàng tự động
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randStr = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `ORD${dateStr}${randStr}`;

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ message: "Transaction error" });

    // Kiểm tra tồn kho trước khi tạo đơn hàng
    const checkStockPromises = items.map((item) => {
      return new Promise((resolve, reject) => {
        if (item.size_id) {
          // Kiểm tra tồn kho theo size
          db.query(
            "SELECT stock_quantity FROM product_sizes WHERE product_id = ? AND size_id = ?",
            [item.product_id, item.size_id],
            (err, results) => {
              if (err) return reject(err);
              if (results.length === 0) {
                return reject(
                  new Error(
                    `Size không tồn tại cho sản phẩm ID ${item.product_id}`
                  )
                );
              }
              if (results[0].stock_quantity < item.quantity) {
                return reject(
                  new Error(
                    `Không đủ tồn kho cho size ${item.size_name}. Còn lại: ${results[0].stock_quantity}`
                  )
                );
              }
              resolve();
            }
          );
        } else {
          // Kiểm tra tồn kho sản phẩm chung
          db.query(
            "SELECT stock_quantity FROM products WHERE id = ?",
            [item.product_id],
            (err, results) => {
              if (err) return reject(err);
              if (results.length === 0) {
                return reject(
                  new Error(`Sản phẩm ID ${item.product_id} không tồn tại`)
                );
              }
              if (results[0].stock_quantity < item.quantity) {
                return reject(
                  new Error(
                    `Không đủ tồn kho. Còn lại: ${results[0].stock_quantity}`
                  )
                );
              }
              resolve();
            }
          );
        }
      });
    });

    Promise.all(checkStockPromises)
      .then(() => {
        // Create order với status mặc định là 'pending'
        db.query(
          `INSERT INTO orders (order_number, user_id, total_amount, shipping_address, shipping_fee, customer_phone, payment_method, coupon_id, coupon_code, discount_amount, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())`,
          [
            orderNumber,
            user_id,
            total_amount,
            shipping_address,
            shipping_fee,
            customer_phone,
            payment_method,
            coupon_id || null,
            coupon_code || null,
            discount_amount || 0,
          ],
          (err, orderResult) => {
            if (err) {
              console.error("Order insert error:", err);
              return db.rollback(() => {
                res.status(500).json({
                  success: false,
                  message: "Database error",
                  error: err.message,
                });
              });
            }

            const orderId = orderResult.insertId;

            // Insert order items với size information
            const itemQueries = items.map((item) => {
              return new Promise((resolve, reject) => {
                db.query(
                  "INSERT INTO order_items (order_id, product_id, quantity, price, size_id, size_name) VALUES (?, ?, ?, ?, ?, ?)",
                  [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price,
                    item.size_id || null,
                    item.size_name || null,
                  ],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                );
              });
            });

            // Cập nhật tồn kho sau khi insert order items
            const updateStockPromises = items.map((item) => {
              return new Promise((resolve, reject) => {
                if (item.size_id) {
                  // Giảm tồn kho theo size
                  db.query(
                    "UPDATE product_sizes SET stock_quantity = stock_quantity - ? WHERE product_id = ? AND size_id = ?",
                    [item.quantity, item.product_id, item.size_id],
                    (err, result) => {
                      if (err) {
                        console.error("Error updating size stock:", err);
                        return reject(err);
                      }
                      console.log(
                        `Updated size stock: Product ${item.product_id}, Size ${item.size_id}, Decreased by ${item.quantity}`
                      );

                      // Cập nhật tổng tồn kho của sản phẩm
                      updateProductTotalStock(item.product_id)
                        .then(() => resolve())
                        .catch(reject);
                    }
                  );
                } else {
                  // Giảm tồn kho sản phẩm chung
                  db.query(
                    "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
                    [item.quantity, item.product_id],
                    (err, result) => {
                      if (err) {
                        console.error("Error updating product stock:", err);
                        return reject(err);
                      }
                      console.log(
                        `Updated product stock: Product ${item.product_id}, Decreased by ${item.quantity}`
                      );
                      resolve();
                    }
                  );
                }
              });
            });

            Promise.all([...itemQueries, ...updateStockPromises])
              .then(() => {
                db.commit((err) => {
                  if (err) {
                    return db.rollback(() => {
                      res.status(500).json({ message: "Commit error" });
                    });
                  }

                  console.log(
                    `Order ${orderId} created successfully with stock updated`
                  );
                  res.status(201).json({
                    message: "Order created successfully",
                    orderId,
                    stockUpdated: true,
                  });
                });
              })
              .catch((error) => {
                console.error("Order processing error:", error);
                db.rollback(() => {
                  res.status(500).json({
                    message: "Order processing error",
                    error: error.message,
                  });
                });
              });
          }
        );
      })
      .catch((error) => {
        console.error("Stock check failed:", error);
        db.rollback(() => {
          res.status(400).json({
            success: false,
            message: error.message || "Kiểm tra tồn kho thất bại",
          });
        });
      });
  });
});

// Update order status với validation
router.put("/:id/status", verifyToken, verifyAdmin, (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  console.log(`Attempting to update order ${orderId} status to: ${status}`);

  // Validate status values theo workflow đơn hàng
  const validStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status value",
      validStatuses,
    });
  }

  // Kiểm tra order tồn tại trước
  db.query(
    "SELECT * FROM orders WHERE id = ?",
    [orderId],
    (err, checkResult) => {
      if (err) {
        console.error("Error checking order:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (checkResult.length === 0) {
        return res.status(404).json({ message: "Order not found" });
      }

      console.log("Current order data:", checkResult[0]);

      // Cập nhật status
      db.query(
        "UPDATE orders SET status = ? WHERE id = ?",
        [status, orderId],
        (err, result) => {
          if (err) {
            console.error("Update status error:", err);
            return res
              .status(500)
              .json({ message: "Database error", error: err.message });
          }

          console.log("Update result:", result);
          console.log(`Order ${orderId} status updated to: ${status}`);

          // Verify update by selecting again
          db.query(
            "SELECT status FROM orders WHERE id = ?",
            [orderId],
            (err, verifyResult) => {
              if (err) {
                console.error("Error verifying update:", err);
              } else {
                console.log("Verified status after update:", verifyResult[0]);
              }

              res.json({
                message: "Order status updated successfully",
                orderId: orderId,
                newStatus: status,
                affectedRows: result.affectedRows,
              });
            }
          );
        }
      );
    }
  );
});

// Hàm cập nhật tổng stock của sản phẩm từ sizes
const updateProductTotalStock = (productId) => {
  return new Promise((resolve, reject) => {
    // Tính tổng stock từ product_sizes
    db.query(
      "SELECT SUM(stock_quantity) as total_stock FROM product_sizes WHERE product_id = ?",
      [productId],
      (err, results) => {
        if (err) return reject(err);

        const totalStock = results[0].total_stock || 0;

        // Cập nhật stock_quantity của product
        db.query(
          "UPDATE products SET stock_quantity = ? WHERE id = ?",
          [totalStock, productId],
          (err, result) => {
            if (err) return reject(err);
            console.log(
              `Updated product ${productId} total stock to: ${totalStock}`
            );
            resolve(totalStock);
          }
        );
      }
    );
  });
};

module.exports = router;
