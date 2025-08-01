import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/admin');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      alert('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, newStatus);
    setShowStatusModal(false);
    setSelectedOrder(null);
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
    <AdminLayout>
      <h2 className="mb-4">🛒 Quản lý đơn hàng</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="admin-table">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Mã sale</th>
                <th>Shipping</th>
                <th>SĐT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.user_name}</td>
                  <td>{order.user_email}</td>
                  <td style={{width:'170px'}}>{order.items}</td>
                  <td>
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(order.total_amount)}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>{order.coupon_code || '-'}</td>
                  <td>{order.shipping_fee !== undefined ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shipping_fee) : '-'}</td>
                  <td>{order.customer_phone || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openStatusModal(order)}
                    >
                      Cập nhật
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showStatusModal && selectedOrder && (
        <div>
          <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
              zIndex: 1060,
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Cập nhật trạng thái đơn #{selectedOrder.id}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-outline-info"
                      disabled={selectedOrder.status !== 'pending'}
                      onClick={() => handleStatusChange('confirmed')}
                    >
                      Xác nhận
                    </button>
                    <button
                      className="btn btn-outline-primary"
                      disabled={selectedOrder.status !== 'confirmed'}
                      onClick={() => handleStatusChange('shipped')}
                    >
                      Đang giao
                    </button>
                    <button
                      className="btn btn-outline-success"
                      disabled={selectedOrder.status !== 'shipped'}
                      onClick={() => handleStatusChange('delivered')}
                    >
                      Đã giao
                    </button>
                    <button
                      className="btn btn-outline-danger"
                      disabled={selectedOrder.status === 'delivered' || selectedOrder.status === 'cancelled'}
                      onClick={() => handleStatusChange('cancelled')}
                    >
                      Hủy đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            style={{
              zIndex: 1050,
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0
            }}
          ></div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;
