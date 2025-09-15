import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import axios from "axios";
import { useModal } from "../../hooks/useModal";
import { getAuthHeaders, isAuthenticated } from "../../utils/auth";

const AdminSizes = () => {
  const [sizes, setSizes] = useState([]);
  const [products, setProducts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [editingSize, setEditingSize] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_type: "shoes",
    sort_order: 0,
    status: 1,
  });

  // Modal áp dụng size
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    product_id: "",
    size_id: "",
    stock_quantity: 0,
  });

  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchSizes();
    fetchProducts();
  }, []);

  const fetchSizes = async () => {
    try {
      const res = await axios.get("/api/sizes");
      console.log("Sizes data:", res.data);
      setSizes(res.data);
    } catch (err) {
      console.error("Lỗi fetch sizes:", err);
      showError("Lỗi tải danh sách size!");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      console.log("Products data:", res.data);
      setProducts(res.data);
    } catch (err) {
      console.error("Lỗi fetch products:", err);
      showError("Lỗi tải danh sách sản phẩm!");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category_type: "shoes",
      sort_order: 0,
      status: 1,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra authentication trước
    if (!isAuthenticated()) {
      showError("Bạn chưa đăng nhập! Vui lòng đăng nhập lại.");
      return;
    }

    if (!formData.name || !formData.name.trim()) {
      showError("Tên size không được để trống!");
      return;
    }

    try {
      console.log("Submitting size data:", formData);

      const dataToSend = {
        name: formData.name.trim(),
        category_type: formData.category_type || "shoes",
        sort_order: parseInt(formData.sort_order) || 0,
        description: formData.description || "",
        status: parseInt(formData.status) || 1,
      };

      const headers = getAuthHeaders();
      console.log("Auth headers:", headers);

      // Kiểm tra xem có token không
      if (!headers.Authorization || headers.Authorization === "Bearer ") {
        showError("Token không hợp lệ! Vui lòng đăng nhập lại.");
        return;
      }

      if (editingSize) {
        const response = await axios.put(
          `/api/sizes/${editingSize.id}`,
          dataToSend,
          { headers }
        );
        console.log("Update response:", response.data);
        showSuccess("Cập nhật size thành công!");
      } else {
        const response = await axios.post("/api/sizes", dataToSend, {
          headers,
        });
        console.log("Create response:", response.data);
        showSuccess("Thêm size thành công!");
      }

      setShowModal(false);
      setEditingSize(null);
      resetForm();
      fetchSizes();
    } catch (err) {
      console.error("Lỗi submit size:", err);
      console.error("Error response:", err.response?.data);

      if (
        err.response?.status === 401 ||
        err.response?.data?.message === "Invalid token."
      ) {
        showError(
          "Token đã hết hạn hoặc không hợp lệ! Vui lòng đăng nhập lại."
        );
        // Redirect về login
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Lỗi khi lưu size!";
        showError(errorMsg);
      }
    }
  };

  const handleEdit = (size) => {
    setEditingSize(size);
    setFormData(size);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    showConfirm("Bạn có chắc muốn xóa size này?", async () => {
      try {
        await axios.delete(`/api/sizes/${id}`, {
          headers: getAuthHeaders(),
        });
        showSuccess("Xóa size thành công!");
        fetchSizes();
      } catch (err) {
        showError("Lỗi khi xóa size!");
      }
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSize(null);
    resetForm();
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!applyData.product_id || !applyData.size_id) {
      showError("Vui lòng chọn sản phẩm và size!");
      return;
    }

    try {
      console.log("=== DEBUG APPLY SIZE ===");
      console.log("Applying size data:", applyData);

      // Test backend connectivity first
      try {
        console.log("Testing backend connection...");
        const testRes = await axios.get("/api/test");
        console.log("Backend test response:", testRes.data);
      } catch (testErr) {
        console.error("Backend test failed:", testErr);
        showError("Không thể kết nối tới backend server!");
        return;
      }

      const headers = getAuthHeaders();
      console.log("Auth headers:", headers);

      if (!headers.Authorization || headers.Authorization === "Bearer ") {
        showError("Token không hợp lệ! Vui lòng đăng nhập lại.");
        return;
      }

      console.log("Sending POST to /api/product-sizes...");
      console.log("Data:", applyData);

      const response = await axios.post("/api/product-sizes", applyData, {
        headers,
        timeout: 10000,
      });

      console.log("Apply response:", response.data);
      showSuccess("Áp dụng size cho sản phẩm thành công!");
      setShowApplyModal(false);
      setApplyData({ product_id: "", size_id: "", stock_quantity: 0 });
    } catch (err) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error:", err);
      console.error("Response:", err.response);
      console.error("Config:", err.config);

      if (err.response?.status === 404) {
        showError(
          `Route không tồn tại: ${err.config?.url}. Kiểm tra backend có route /api/product-sizes không.`
        );
      } else if (err.response?.status === 401) {
        showError("Token đã hết hạn! Vui lòng đăng nhập lại.");
      } else {
        const errorMsg =
          err.response?.data?.error ||
          err.message ||
          "Lỗi khi áp dụng size cho sản phẩm!";
        showError(errorMsg);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📏 Quản lý Size</h2>
        <div>
          <button
            className="btn btn-admin-primary me-2"
            onClick={() => setShowModal(true)}
          >
            ➕ Thêm Size
          </button>
          <button
            className="btn btn-admin-primary me-2"
            onClick={() => setShowApplyModal(true)}
          >
            ✅ Áp dụng Size
          </button>
        </div>
      </div>

      <div className="admin-table">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tên</th>
              <th>Mô tả</th>
              <th>Loại</th>
              <th>Thứ tự</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sizes.map((size, idx) => (
              <tr key={size.id}>
                <td>{idx + 1}</td>
                <td>{size.name}</td>
                <td>{size.description}</td>
                <td>{size.category_type}</td>
                <td>{size.sort_order}</td>
                <td>
                  {size.status === 1 ? (
                    <span className="badge bg-success">Kích hoạt</span>
                  ) : (
                    <span className="badge bg-secondary">Không kích hoạt</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEdit(size)}
                  >
                    Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(size.id)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa size */}
      {showModal && (
        <div className="modal show d-block admin-modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSize ? "Sửa Size" : "Thêm Size"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleModalClose}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Tên Size */}
                  <div className="mb-3">
                    <label className="form-label">Tên Size:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  {/* Mô tả */}
                  <div className="mb-3">
                    <label className="form-label">Mô tả:</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  {/* Loại */}
                  <div className="mb-3">
                    <label className="form-label">Loại:</label>
                    <select
                      className="form-select"
                      value={formData.category_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category_type: e.target.value,
                        })
                      }
                    >
                      <option value="shoes">Giày</option>
                      <option value="clothing">Quần áo</option>
                    </select>
                  </div>
                  {/* Thứ tự */}
                  <div className="mb-3">
                    <label className="form-label">Thứ tự sắp xếp:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  {/* Trạng thái */}
                  <div className="mb-3">
                    <label className="form-label">Trạng thái:</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: parseInt(e.target.value),
                        })
                      }
                    >
                      <option value={1}>Kích hoạt</option>
                      <option value={0}>Không kích hoạt</option>
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleModalClose}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingSize ? "Cập nhật" : "Thêm"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal áp dụng size cho sản phẩm */}
      {showApplyModal && (
        <div className="modal show d-block admin-modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Áp dụng Size cho sản phẩm</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApplyModal(false)}
                ></button>
              </div>
              <form onSubmit={handleApply}>
                <div className="modal-body">
                  {/* Chọn sản phẩm */}
                  <div className="mb-3">
                    <label className="form-label">Sản phẩm:</label>
                    <select
                      className="form-select"
                      value={applyData.product_id}
                      onChange={(e) =>
                        setApplyData({
                          ...applyData,
                          product_id: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Chọn size */}
                  <div className="mb-3">
                    <label className="form-label">Size:</label>
                    <select
                      className="form-select"
                      value={applyData.size_id}
                      onChange={(e) =>
                        setApplyData({ ...applyData, size_id: e.target.value })
                      }
                      required
                    >
                      <option value="">-- Chọn size --</option>
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Tồn kho */}
                  <div className="mb-3">
                    <label className="form-label">Số lượng tồn kho:</label>
                    <input
                      type="number"
                      className="form-control"
                      value={applyData.stock_quantity}
                      onChange={(e) =>
                        setApplyData({
                          ...applyData,
                          stock_quantity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowApplyModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Áp dụng
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
    </AdminLayout>
  );
};

export default AdminSizes;
