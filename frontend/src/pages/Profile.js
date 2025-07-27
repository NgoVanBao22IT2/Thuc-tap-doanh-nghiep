import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/user');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'bg-warning';
      case 'confirmed': return 'bg-info';
      case 'shipped': return 'bg-primary';
      case 'delivered': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="container my-5">
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="profile-card">
            <div className="text-center mb-4">
              <div className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center" 
                   style={{width: '80px', height: '80px'}}>
                <i className="bi bi-person-fill fs-1"></i>
              </div>
            </div>
            <h5 className="text-center mb-4">Thông tin cá nhân</h5>
            <div className="mb-3">
              <small className="text-white-50">Họ tên:</small>
              <p className="fw-bold mb-2">{currentUser?.name}</p>
            </div>
            <div className="mb-3">
              <small className="text-white-50">Email:</small>
              <p className="fw-bold mb-2">{currentUser?.email}</p>
            </div>
            <div className="mb-3">
              <small className="text-white-50">Vai trò:</small>
              <p className="fw-bold mb-0">
                <span className={`badge ${currentUser?.role === 'admin' ? 'bg-warning' : 'bg-light text-dark'}`}>
                  {currentUser?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="bi bi-clock-history me-2 text-primary"></i>
              Lịch sử đơn hàng
            </h4>
            <span className="badge bg-primary">
              {orders.length} đơn hàng
            </span>
          </div>
          
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-4">
                <i className="bi bi-bag-x display-1 text-muted"></i>
              </div>
              <h5 className="text-muted">Bạn chưa có đơn hàng nào</h5>
              <p className="text-muted">Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên!</p>
              <a href="/products" className="btn btn-primary">
                <i className="bi bi-shop me-2"></i>
                Mua sắm ngay
              </a>
            </div>
          ) : (
            <div className="row g-4">
              {orders.map(order => (
                <div key={order.id} className="col-12">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="text-center">
                            <div className="fw-bold text-primary mb-1">#{order.id}</div>
                            <small className="text-muted">Mã đơn</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div>
                            <div className="fw-medium text-truncate" style={{maxWidth: '200px'}}>
                              {order.items}
                            </div>
                            <small className="text-muted">Sản phẩm</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div>
                            <div className="fw-bold text-success">
                              {new Intl.NumberFormat('vi-VN', { 
                                style: 'currency', 
                                currency: 'VND' 
                              }).format(order.total_amount)}
                            </div>
                            <small className="text-muted">Tổng tiền</small>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div>
                            <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-2">
                          <div>
                            <div className="fw-medium">
                              {new Date(order.created_at).toLocaleDateString('vi-VN')}
                            </div>
                            <small className="text-muted">Ngày đặt</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
