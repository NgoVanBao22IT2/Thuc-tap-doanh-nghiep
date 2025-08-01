import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBrands from './pages/admin/AdminBrands';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminContacts from './pages/admin/AdminContacts';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSlides from './pages/admin/AdminSlides';
import ProtectedRoute from './components/ProtectedRoute';
import Categories from './pages/Categories';
import Contact from './pages/Contact';
import OrdersHistory from './pages/OrdersHistory';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAdminRoute && <Navbar />}
      <main className={`flex-grow-1 ${isAdminRoute ? '' : ''}`}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/categories" element={<Categories />} />
          
          {/* User Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/orders-history" element={
            <ProtectedRoute>
              <OrdersHistory />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes - Completely separate */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories" element={
            <ProtectedRoute adminOnly>
              <AdminCategories />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/brands" element={
            <ProtectedRoute adminOnly>
              <AdminBrands />
            </ProtectedRoute>
          } />
          <Route path="/admin/coupons" element={
            <ProtectedRoute adminOnly>
              <AdminCoupons />
            </ProtectedRoute>
          } />
          <Route path="/admin/contacts" element={
            <ProtectedRoute adminOnly>
              <AdminContacts />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute adminOnly>
              <AdminSettings />
            </ProtectedRoute>
          } />
          <Route path="/admin/slides" element={
            <ProtectedRoute adminOnly>
              <AdminSlides />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
