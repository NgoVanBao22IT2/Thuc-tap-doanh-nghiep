const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware - phải đặt trước routes
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Database connection (MySQL)
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "badminton_shop",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database as id " + db.threadId);
});

// Make db available globally
global.db = db;

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route để debug
app.get("/api/test", (req, res) => {
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "GET /api/test",
      "GET /api/products",
      "POST /api/product-sizes",
      "GET /api/sizes",
      "POST /api/sizes",
    ],
  });
});

// Routes - đăng ký đúng thứ tự (product-sizes TRƯỚC sizes)
app.use("/api/products", require("./routes/products"));
app.use("/api/product-sizes", require("./routes/productSizes"));
app.use("/api/sizes", require("./routes/sizes"));

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Registered routes:");
  console.log("- GET /api/test");
  console.log("- /api/products");
  console.log("- /api/product-sizes");
  console.log("- /api/sizes");
  console.log("\nTesting route registration...");

  // Test route registration
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(
        `Route: ${Object.keys(middleware.route.methods)} ${
          middleware.route.path
        }`
      );
    } else if (middleware.name === "router") {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(
            `Nested Route: ${Object.keys(handler.route.methods)} ${
              handler.route.path
            }`
          );
        }
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    method: req.method,
    path: req.path,
    availableRoutes: [
      "/api/test",
      "/api/products",
      "/api/product-sizes",
      "/api/sizes",
    ],
  });
});
