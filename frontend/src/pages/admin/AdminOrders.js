import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import axios from "axios";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { modal, hideModal, showSuccess, showError } = useModal();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders/admin");
      console.log("Orders data received:", response.data);

      // Log để kiểm tra status của từng order
      response.data.forEach((order, index) => {
        console.log(`Order ${order.id}:`, {
          status: order.status,
          statusType: typeof order.status,
          statusValue: JSON.stringify(order.status),
          fullOrder: order, // Log toàn bộ object order
        });
      });

      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      showSuccess("Cập nhật trạng thái thành công!");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      showError(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;

    try {
      console.log(`Updating order ${selectedOrder.id} to status: ${newStatus}`); // Debug log

      const response = await axios.put(
        `/api/orders/${selectedOrder.id}/status`,
        {
          status: newStatus,
        }
      );

      console.log("Update response:", response.data); // Debug log

      // Cập nhật trực tiếp order trong state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: newStatus }
            : order
        )
      );

      setShowStatusModal(false);
      setSelectedOrder(null);
      showSuccess("Cập nhật trạng thái thành công!");

      // Refresh lại data từ server để đảm bảo đồng bộ
      setTimeout(() => {
        fetchOrders();
      }, 500);
    } catch (error) {
      console.error("Error updating order status:", error);
      console.error("Error response:", error.response?.data); // Debug log
      showError(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const getStatusText = (status) => {
    console.log("Getting status text for:", status, "type:", typeof status); // Debug log

    if (!status || status === null || status === undefined) {
      return "Chờ xác nhận"; // Thay đổi default thành pending thay vì "Chưa có trạng thái"
    }

    switch (String(status).toLowerCase()) {
      // Đảm bảo convert về string và lowercase
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        console.log("Unknown status:", status); // Debug log
        return "Chờ xác nhận"; // Default fallback
    }
  };

  const getStatusBadgeClass = (status) => {
    if (!status || status === null || status === undefined) return "bg-warning";

    switch (String(status).toLowerCase()) {
      // Đảm bảo convert về string
      case "pending":
        return "bg-warning";
      case "confirmed":
        return "bg-info";
      case "shipped":
        return "bg-primary";
      case "delivered":
        return "bg-success";
      case "cancelled":
        return "bg-danger";
      case "refunded":
        return "bg-dark";
      default:
        return "bg-warning"; // Default to pending style
    }
  };

  return (
    <>
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
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.user_name}</td>
                    <td>{order.user_email}</td>
                    <td style={{ width: "170px" }}>
                      {order.items || "Không có thông tin sản phẩm"}
                    </td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.total_amount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${getStatusBadgeClass(order.status)}`}
                      >
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{order.coupon_code || "-"}</td>
                    <td>
                      {order.shipping_fee !== undefined
                        ? new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(order.shipping_fee)
                        : "-"}
                    </td>
                    <td>{order.customer_phone || "-"}</td>
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
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Cập nhật trạng thái đơn #{selectedOrder.id}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowStatusModal(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3">
                      <small className="text-muted">
                        Trạng thái hiện tại:{" "}
                      </small>
                      <span
                        className={`badge ${getStatusBadgeClass(
                          selectedOrder.status
                        )} ms-2`}
                      >
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-info"
                        disabled={selectedOrder.status !== "pending"}
                        onClick={() => handleStatusChange("confirmed")}
                      >
                        <i className="bi bi-check-circle me-2"></i>
                        Xác nhận đơn hàng
                      </button>

                      <button
                        className="btn btn-outline-primary"
                        disabled={selectedOrder.status !== "confirmed"}
                        onClick={() => handleStatusChange("shipped")}
                      >
                        <i className="bi bi-truck me-2"></i>
                        Đang giao hàng
                      </button>

                      <button
                        className="btn btn-outline-success"
                        disabled={selectedOrder.status !== "shipped"}
                        onClick={() => handleStatusChange("delivered")}
                      >
                        <i className="bi bi-check2-all me-2"></i>
                        Đã giao hàng
                      </button>

                      <hr className="my-2" />

                      <button
                        className="btn btn-outline-danger"
                        disabled={
                          selectedOrder.status === "delivered" ||
                          selectedOrder.status === "cancelled"
                        }
                        onClick={() => handleStatusChange("cancelled")}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Hủy đơn hàng
                      </button>

                      <button
                        className="btn btn-outline-dark"
                        disabled={selectedOrder.status !== "delivered"}
                        onClick={() => handleStatusChange("refunded")}
                      >
                        <i className="bi bi-arrow-return-left me-2"></i>
                        Hoàn tiền
                      </button>
                    </div>

                    <div className="mt-3">
                      <small className="text-muted">
                        <strong>Workflow:</strong> Chờ xác nhận → Đã xác nhận →
                        Đang giao hàng → Đã giao hàng
                        <br />
                        <strong>Lưu ý:</strong> Chỉ có thể xác nhận đơn ở trạng
                        thái "Chờ xác nhận"
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal-backdrop show"
              style={{
                zIndex: 1050,
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            ></div>
          </div>
        )}
      </AdminLayout>

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

export default AdminOrders;
