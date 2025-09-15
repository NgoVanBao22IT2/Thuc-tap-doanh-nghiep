import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import ScrollToTopButton from "../components/ScrollToTopButton";

const Orders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  // Thêm hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`/api/orders/user/${currentUser.id}`);
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: "bg-warning text-dark", text: "Chờ xác nhận" },
      confirmed: { class: "bg-info", text: "Đã xác nhận" },
      shipped: { class: "bg-primary", text: "Đang giao" },
      delivered: { class: "bg-success", text: "Đã giao" },
      cancelled: { class: "bg-danger", text: "Đã hủy" },
    };
    const config = statusConfig[status] || {
      class: "bg-secondary",
      text: status,
    };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className="container my-5">
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <h2 className="fw-bold mb-4">Lịch sử đơn hàng</h2>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-cart-x display-1 text-muted"></i>
          </div>
          <h4 className="text-muted">Chưa có đơn hàng nào</h4>
          <p className="text-muted">Hãy đặt hàng để xem lịch sử tại đây</p>
          <a href="/products" className="btn btn-success">
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order.id} className="col-12 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">Đơn hàng #{order.id}</h6>
                    <small className="text-muted">
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Sản phẩm:</h6>
                      <p className="mb-2">{order.items}</p>
                      <h6>Địa chỉ giao hàng:</h6>
                      <p className="mb-2">{order.shipping_address}</p>
                      <h6>Số điện thoại:</h6>
                      <p className="mb-0">{order.customer_phone}</p>
                    </div>
                    <div className="col-md-4 text-end">
                      <h6>Tổng tiền:</h6>
                      <h4 className="text-danger mb-2">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(order.total_amount)}
                      </h4>
                      {order.coupon_code && (
                        <div>
                          <small className="text-success">
                            Mã giảm giá: {order.coupon_code}
                          </small>
                        </div>
                      )}
                      <div className="mt-2">
                        <small className="text-muted">
                          Thanh toán:{" "}
                          {order.payment_method === "cod"
                            ? "COD"
                            : "Chuyển khoản"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Nút trở lại đầu trang */}
          <ScrollToTopButton bottom={88} right={32} zIndex={999} />
        </div>
      )}
    </div>
  );
};

export default Orders;
