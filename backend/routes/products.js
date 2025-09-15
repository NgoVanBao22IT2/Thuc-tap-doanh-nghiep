const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// Get all products with category and brand info
router.get("/", (req, res) => {
  const query = `
    SELECT p.*, c.name as category_name, b.name as brand_name 
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.status = 'active'
    ORDER BY p.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});

// Get product by ID with full details
router.get("/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  // Query để lấy thông tin sản phẩm
  const productQuery = `
    SELECT p.*, c.name as category_name, b.name as brand_name, b.logo as brand_logo
    FROM products p 
    LEFT JOIN categories c ON p.category_id = c.id 
    LEFT JOIN brands b ON p.brand_id = b.id
    WHERE p.id = ? AND p.status = 'active'
  `;

  db.query(productQuery, [productId], (err, productResults) => {
    if (err) {
      console.error("Lỗi query product:", err);
      return res.status(500).json({ error: "Lỗi tải sản phẩm!" });
    }
    if (productResults.length === 0) {
      return res.status(404).json({ error: "Sản phẩm không tồn tại!" });
    }

    const product = productResults[0];

    // Query để lấy sizes của sản phẩm
    const sizesQuery = `
      SELECT s.id, s.name, ps.stock_quantity as stock
      FROM product_sizes ps
      JOIN sizes s ON ps.size_id = s.id
      WHERE ps.product_id = ? AND s.status = 1
      ORDER BY s.sort_order, s.name
    `;

    db.query(sizesQuery, [productId], (err, sizesResults) => {
      if (err) {
        console.error("Lỗi query sizes:", err);
        return res.status(500).json({ error: "Lỗi tải sizes sản phẩm!" });
      }

      // Gắn sizes vào product
      product.sizes = sizesResults;

      // Increment view count
      db.query("UPDATE products SET views = views + 1 WHERE id = ?", [
        productId,
      ]);

      console.log("Product with sizes:", product); // Debug log
      res.json(product);
    });
  });
});

// Create product (Admin only)
router.post("/", verifyToken, verifyAdmin, (req, res) => {
  const {
    name,
    slug,
    description,
    sku,
    price,
    sale_price,
    stock_quantity,
    category_id,
    brand_id,
    image_url,
    status,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !price ||
    stock_quantity === undefined ||
    stock_quantity === null ||
    !category_id ||
    !sku
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Chuyển đổi kiểu dữ liệu
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
  const productSku = sku || `SKU-${Date.now()}`;
  const productPrice = parseFloat(price);
  const productSalePrice = sale_price ? parseFloat(sale_price) : null;
  const productStock = parseInt(stock_quantity);
  const productCategory = parseInt(category_id);
  const productBrand = brand_id ? parseInt(brand_id) : null;
  const productStatus = status || "active";

  db.query(
    `INSERT INTO products 
      (name, slug, description, sku, price, sale_price, stock_quantity, category_id, brand_id, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      productSlug,
      description || "",
      productSku,
      productPrice,
      productSalePrice,
      productStock,
      productCategory,
      productBrand,
      image_url || "",
      productStatus,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      // Trả về sản phẩm vừa tạo
      db.query(
        `SELECT * FROM products WHERE id = ?`,
        [result.insertId],
        (err2, rows) => {
          if (err2)
            return res
              .status(500)
              .json({ message: "Database error", error: err2.message });
          res.status(201).json({
            message: "Product created successfully",
            product: rows[0],
          });
        }
      );
    }
  );
});

// Update product (Admin only)
router.put("/:id", verifyToken, verifyAdmin, (req, res) => {
  const {
    name,
    slug,
    description,
    sku,
    price,
    sale_price,
    stock_quantity,
    category_id,
    brand_id,
    image_url,
    status,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !price ||
    stock_quantity === undefined ||
    stock_quantity === null ||
    !category_id ||
    !sku
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Chuyển đổi kiểu dữ liệu
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
  const productPrice = parseFloat(price);
  const productSalePrice = sale_price ? parseFloat(sale_price) : null;
  const productStock = parseInt(stock_quantity);
  const productCategory = parseInt(category_id);
  const productBrand = brand_id ? parseInt(brand_id) : null;
  const productStatus = status || "active";

  db.query(
    `UPDATE products SET 
      name = ?, slug = ?, description = ?, sku = ?, price = ?, sale_price = ?, stock_quantity = ?, category_id = ?, brand_id = ?, image_url = ?, status = ?
      WHERE id = ?`,
    [
      name,
      productSlug,
      description || "",
      sku,
      productPrice,
      productSalePrice,
      productStock,
      productCategory,
      productBrand,
      image_url || "",
      productStatus,
      req.params.id,
    ],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ message: "Database error", error: err.message });
      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Product not found" });
      // Trả về sản phẩm vừa cập nhật
      db.query(
        `SELECT * FROM products WHERE id = ?`,
        [req.params.id],
        (err2, rows) => {
          if (err2)
            return res
              .status(500)
              .json({ message: "Database error", error: err2.message });
          res.json({
            message: "Product updated successfully",
            product: rows[0],
          });
        }
      );
    }
  );
});

// Delete product (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {
  const productId = parseInt(req.params.id);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }
  db.query("DELETE FROM products WHERE id = ?", [productId], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    if (result.affectedRows === 0)
      return res
        .status(404)
        .json({ message: "Product not found or already deleted" });
    res.json({ message: "Product deleted successfully", id: productId });
  });
});

module.exports = router;
