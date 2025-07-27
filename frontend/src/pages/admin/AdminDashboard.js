import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalBrands: 0,
    totalCoupons: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, brandsRes, couponsRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/orders/admin'),
        axios.get('/api/brands/admin').catch(() => ({ data: [] })),
        axios.get('/api/coupons/admin').catch(() => ({ data: [] }))
      ]);
      
      const orders = ordersRes.data;
      const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      
      // Tính số user từ orders (unique user_id)
      const uniqueUsers = [...new Set(orders.map(order => order.user_id))].length;
      
      setStats({
        totalProducts: productsRes.data.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        totalUsers: uniqueUsers,
        totalBrands: brandsRes.data.length,
        totalCoupons: couponsRes.data.length,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Stats Cards */}
      <div className="row">
        <div className="col-xl-3 col-md-6">
          <div className="stats-card primary">
            <div className="d-flex justify-content-between">
              <div>
                <div className="label">Tổng sản phẩm</div>
                <div className="number">{stats.totalProducts}</div>
              </div>
              <div className="icon">📦</div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="stats-card success">
            <div className="d-flex justify-content-between">
              <div>
                <div className="label">Tổng đơn hàng</div>
                <div className="number">{stats.totalOrders}</div>
              </div>
              <div className="icon">🛒</div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="stats-card warning">
            <div className="d-flex justify-content-between">
              <div>
                <div className="label">Doanh thu</div>
                <div className="number">
                  {new Intl.NumberFormat('vi-VN', { 
                    notation: 'compact',
                    maximumFractionDigits: 1 
                  }).format(stats.totalRevenue)}₫
                </div>
              </div>
              <div className="icon">💰</div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="stats-card danger">
            <div className="d-flex justify-content-between">
              <div>
                <div className="label">Người dùng</div>
                <div className="number">{stats.totalUsers}</div>
              </div>
              <div className="icon">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="card-header">
          <h5 className="mb-0">⚡ Thao tác nhanh</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-2 mb-3">
              <Link to="/admin/products" className="btn btn-admin-primary w-100 py-3">
                <div>📦</div>
                <div>Sản phẩm</div>
              </Link>
            </div>
            <div className="col-md-2 mb-3">
              <Link to="/admin/orders" className="btn btn-admin-success w-100 py-3">
                <div>🛒</div>
                <div>Đơn hàng</div>
              </Link>
            </div>
            <div className="col-md-2 mb-3">
              <Link to="/admin/categories" className="btn btn-outline-primary w-100 py-3">
                <div>📂</div>
                <div>Danh mục</div>
              </Link>
            </div>
            <div className="col-md-2 mb-3">
              <Link to="/admin/brands" className="btn btn-outline-info w-100 py-3">
                <div>🏷️</div>
                <div>Thương hiệu</div>
              </Link>
            </div>
            <div className="col-md-2 mb-3">
              <Link to="/admin/coupons" className="btn btn-outline-warning w-100 py-3">
                <div>🎫</div>
                <div>Mã giảm giá</div>
              </Link>
            </div>
            <div className="col-md-2 mb-3">
              <Link to="/" className="btn btn-outline-secondary w-100 py-3">
                <div>🏠</div>
                <div>Xem website</div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">📋 Đơn hàng gần đây</h5>
          <Link to="/admin/orders" className="btn btn-sm btn-outline-primary">
            Xem tất cả
          </Link>
        </div>
        <div className="card-body p-0">
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted">Chưa có đơn hàng nào</div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <span className="fw-bold text-primary">#{order.id}</span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-medium">{order.user_name}</div>
                          <small className="text-muted">{order.user_email}</small>
                        </div>
                      </td>
                      <td>
                        <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                          {order.items}
                        </span>
                      </td>
                      <td>
                        <span className="fw-bold">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(order.total_amount)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
