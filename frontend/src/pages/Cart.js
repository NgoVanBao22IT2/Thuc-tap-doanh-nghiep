import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { useModal } from '../hooks/useModal';
import axios from 'axios';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Thêm state cho phương thức thanh toán
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [phone, setPhone] = useState('');
  const [couponError, setCouponError] = useState('');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const { modal, hideModal, showSuccess, showError } = useModal();

  React.useEffect(() => {
    // Lấy ngưỡng miễn phí ship từ settings
    axios.get('/api/settings').then(res => {
      const threshold = res.data.find(s => s.key_name === 'free_shipping_threshold');
      setFreeShippingThreshold(threshold ? parseInt(threshold.value) : 0);
    });
  }, []);

  React.useEffect(() => {
    // Tính phí giao hàng
    const total = getCartTotal() - discountAmount;
    setShippingFee(total >= freeShippingThreshold ? 0 : 30000);
  }, [getCartTotal(), discountAmount, freeShippingThreshold]);

  // Lấy danh sách mã giảm giá từ database khi vào trang
  React.useEffect(() => {
    if (currentUser) {
      axios.get(`/api/coupons/available?user_id=${currentUser.id}`)
        .then(res => setAvailableCoupons(res.data))
        .catch(() => setAvailableCoupons([]));
    }
  }, [currentUser]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    try {
      const res = await axios.post('/api/coupons/apply', {
        code: couponCode,
        total_amount: getCartTotal(),
        user_id: currentUser?.id // truyền user_id để backend kiểm tra đúng user
      });
      if (res.data.success) {
        setDiscountAmount(res.data.discount);
        setCouponError('');
      } else {
        setDiscountAmount(0);
        setCouponError(res.data.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      setDiscountAmount(0);
      setCouponError('Mã giảm giá không hợp lệ');
    }
  };

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.status !== 'active') {
      showError('Tài khoản của bạn đã bị khóa hoặc chưa được kích hoạt. Vui lòng liên hệ admin để mở lại!');
      return;
    }
    if (!shippingAddress.trim()) {
      showError('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }
    if (!phone.trim()) {
      showError('Vui lòng nhập số điện thoại!');
      return;
    }
    setLoading(true);
    try {
      const selectedCouponObj = availableCoupons.find(c => c.code === couponCode);
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: getCartTotal(),
        shipping_address: shippingAddress,
        shipping_fee: shippingFee,
        customer_phone: phone,
        payment_method: paymentMethod,
        coupon_code: couponCode,
        discount_amount: discountAmount,
        coupon_id: selectedCouponObj?.id || null,
        user_id: currentUser?.id
      };
      const res = await axios.post('/api/orders', orderData);
      
      if (res.data && res.data.success === false) {
        showError(res.data.message || 'Có lỗi xảy ra khi đặt hàng!');
        setLoading(false);
        return;
      }
      
      // Chỉ hiển thị modal thành công, chưa clear cart
      showSuccess(
        `Đặt hàng thành công!\n\nMã đơn hàng: #${res.data.orderId || 'N/A'}\nTổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getCartTotal() - discountAmount + shippingFee)}\n\nCảm ơn bạn đã mua hàng!`, 
        'Đặt hàng thành công', 
        () => {
          // Clear cart và chuyển trang chỉ sau khi user click OK
          clearCart();
          if (paymentMethod === 'bank') {
            navigate('/payment-bank-info');
          } else {
            navigate('/orders'); // Chuyển đến trang đơn hàng thay vì profile
          }
        }
      );
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đặt hàng!';
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container my-5">
        <div className="text-center">
          <div className="mb-4">
            <i className="bi bi-cart-x display-1 text-muted"></i>
          </div>
          <h2>Giỏ hàng trống</h2>
          <p className="text-muted mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link to="/products" className="btn btn-success btn-lg">
            <i className="bi bi-bag-plus me-2"></i>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
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
                          <p className="card-text fw-bold text-danger">
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
                  <strong className="text-danger fs-4">
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
                
                {/* Nhập số điện thoại nhận hàng */}
                <div className="mb-3">
                  <label htmlFor="phone" className="form-label">
                    Số điện thoại nhận hàng:
                  </label>
                  <input
                    id="phone"
                    className="form-control"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại..."
                  />
                </div>
                
                {/* Chọn phương thức thanh toán */}
                <div className="mb-3">
                  <label className="form-label">Phương thức thanh toán:</label>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="payment-cod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="payment-cod">
                      Thanh toán khi nhận hàng (COD)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="payment-bank"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={e => setPaymentMethod(e.target.value)}
                    />
                    <label className="form-check-label" htmlFor="payment-bank">
                      Chuyển khoản ngân hàng
                    </label>
                  </div>
                  {/* Có thể thêm các phương thức khác nếu cần */}
                </div>
                
                {/* Nhập mã giảm giá */}
                <div className="mb-3">
                  <label className="form-label">Mã giảm giá:</label>
                  {availableCoupons.length === 0 ? (
                    <div className="text-muted">Không có mã giảm giá</div>
                  ) : (
                    <div className="input-group">
                      <select
                        className="form-select"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                      >
                        <option value="">-- Chọn mã giảm giá --</option>
                        {availableCoupons.map(coupon => (
                          <option key={coupon.code} value={coupon.code}>
                            {coupon.code} - {coupon.name} ({coupon.type === 'percentage' ? `${coupon.value}%` : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.value)})
                            {coupon.description ? ` - ${coupon.description}` : ''}
                            {coupon.valid_to ? ` - HSD: ${new Date(coupon.valid_to).toLocaleDateString('vi-VN')}` : ''}
                          </option>
                        ))}
                      </select>
                      <button className="btn btn-outline-primary" type="button" onClick={handleApplyCoupon}>
                        Áp dụng
                      </button>
                    </div>
                  )}
                  {couponError && <div className="text-danger mt-1">{couponError}</div>}
                  {discountAmount > 0 && (
                    <div className="text-success mt-1">Đã giảm: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discountAmount)}</div>
                  )}
                </div>
                
                <div className="mb-3 d-flex justify-content-between">
                  <span>Phí giao hàng:</span>
                  <span className="fw-bold">{shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(shippingFee)}</span>
                </div>
                
                <div className="mb-3 d-flex justify-content-between">
                  <span>Tổng cộng sau giảm giá:</span>
                  <strong className="text-danger fs-4">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(getCartTotal() - discountAmount + shippingFee)}
                  </strong>
                </div>
                
                <button 
                  className="btn btn-success w-100 mb-2"
                  onClick={handleCheckout}
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
                
                <Link to="/products" className="btn btn-outline-success w-100">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Modal
        show={modal.show}
        onClose={hideModal}
        title={modal.title}
        message={modal.message}
        type={modal.type}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
        cancelText={modal.cancelText}
        showCancel={modal.showCancel}
      />
    </>
  );
};

export default Cart;
