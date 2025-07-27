import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (!shippingAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: getCartTotal(),
        shipping_address: shippingAddress
      };

      await axios.post('/api/orders', orderData);
      clearCart();
      alert('Đặt hàng thành công!');
      navigate('/profile');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Có lỗi xảy ra khi đặt hàng!');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <h2>Giỏ hàng trống</h2>
          <p>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link to="/products" className="btn btn-primary">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h1 className="mb-4">Giỏ hàng</h1>
      
      <div className="row">
        <div className="col-md-8">
          {cartItems.map(item => (
            <div key={item.id} className="card mb-3">
              <div className="row g-0">
                <div className="col-md-3">
                  <img 
                    src={item.image_url || 'https://via.placeholder.com/150x100'} 
                    className="img-fluid rounded-start h-100"
                    alt={item.name}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="row align-items-center">
                      <div className="col-md-6">
                        <h5 className="card-title">{item.name}</h5>
                        <p className="card-text text-muted">{item.category_name}</p>
                        <p className="card-text fw-bold text-primary">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(item.price)}
                        </p>
                      </div>
                      <div className="col-md-3">
                        <div className="input-group">
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            className="form-control text-center"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                            min="0"
                          />
                          <button 
                            className="btn btn-outline-secondary"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <button 
                          className="btn btn-danger"
                          onClick={() => removeFromCart(item.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Tổng đơn hàng</h5>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span>Tổng cộng:</span>
                <strong className="text-primary fs-4">
                  {new Intl.NumberFormat('vi-VN', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(getCartTotal())}
                </strong>
              </div>
              
              <div className="mb-3">
                <label htmlFor="shippingAddress" className="form-label">
                  Địa chỉ giao hàng:
                </label>
                <textarea
                  id="shippingAddress"
                  className="form-control"
                  rows="3"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Nhập địa chỉ giao hàng..."
                />
              </div>
              
              <button 
                className="btn btn-primary w-100 mb-2"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
              
              <Link to="/products" className="btn btn-outline-secondary w-100">
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
