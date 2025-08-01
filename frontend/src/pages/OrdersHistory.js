import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OrdersHistory = () => {
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
      <h4>
        <i className="bi bi-clock-history me-2 text-success"></i>
        Lịch sử đơn hàng
      </h4>
      <span className="badge bg-success mb-3">
        {orders.length} đơn hàng
      </span>
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
          <a href="/products" className="btn btn-success">
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
                        <div className="fw-bold text-success mb-1">#{order.id}</div>
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
  );
};

export default OrdersHistory;
