const express = require("express");
const db = require("../config/database");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const router = express.Router();

// Get all products với sizes information
router.get("/", (req, res) => {
  const query = `
    SELECT p.*, 
           c.name as category_name, 
           b.name as brand_name,
           GROUP_CONCAT(
             JSON_OBJECT(
               'id', ps.size_id,
               'name', s.name,
               'stock', ps.stock_quantity
             )
           ) as sizes_json
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN product_sizes ps ON p.id = ps.product_id
    LEFT JOIN sizes s ON ps.size_id = s.id
    WHERE p.status = 'active'
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    // Parse sizes JSON và tính tổng stock
    const productsWithSizes = results.map((product) => {
      let sizes = [];
      let totalStock = 0;

      if (product.sizes_json) {
        try {
          // Parse JSON string thành array
          const sizesStr = `[${product.sizes_json}]`;
          sizes = JSON.parse(sizesStr);

          // Tính tổng stock từ tất cả sizes
          totalStock = sizes.reduce((sum, size) => sum + (size.stock || 0), 0);
        } catch (e) {
          console.error("Error parsing sizes JSON:", e);
          sizes = [];
          totalStock = product.stock_quantity || 0;
        }
      } else {
        // Nếu không có sizes, dùng stock_quantity gốc
        totalStock = product.stock_quantity || 0;
      }

      // Remove sizes_json field và thêm sizes array + calculated_stock
      const { sizes_json, ...productData } = product;

      return {
        ...productData,
        sizes,
        calculated_stock: totalStock,
      };
    });

    res.json(productsWithSizes);
  });
});

// Get product by ID với sizes information
router.get("/:id", (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  // Query để lấy thông tin sản phẩm
  const productQuery = `
    SELECT p.*, 
           c.name as category_name, 
           b.name as brand_name, 
           b.logo as brand_logo
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

      console.log("Product with sizes:", product);
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

      res.status(201).json({
        message: "Product created successfully",
        productId: result.insertId,
      });
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

      res.json({
        message: "Product updated successfully",
        productId: req.params.id,
      });
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

// Route để sync tất cả product stocks
router.post("/sync-stock", verifyToken, verifyAdmin, async (req, res) => {
  try {
    // Lấy tất cả product IDs
    db.query("SELECT id FROM products", async (err, products) => {
      if (err) return res.status(500).json({ message: "Database error" });

      const updatePromises = products.map((product) =>
        updateProductTotalStock(product.id)
      );

      await Promise.all(updatePromises);

      res.json({
        message: "Synced stock for all products successfully",
        updatedProducts: products.length,
      });
    });
  } catch (error) {
    console.error("Error syncing stock:", error);
    res.status(500).json({ message: "Error syncing stock" });
  }
});

module.exports = router;
