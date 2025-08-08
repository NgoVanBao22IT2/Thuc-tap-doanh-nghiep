const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/slides', require('./routes/slides'));
app.use('/api/settings', require('./routes/settings'));
//app.use('/api/upload', require('./routes/upload')); 
app.use('/api/sizes', require('./routes/sizes')); 
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/cart', require('./routes/cart'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
