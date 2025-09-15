import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";
import { useModal } from "../../hooks/useModal";
import { getAuthHeaders } from "../../utils/auth";

const AdminProductSizes = () => {
  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [productSizes, setProductSizes] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    size_id: "",
    stock_quantity: 0,
  });

  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  // Lấy danh sách sản phẩm và size
  useEffect(() => {
    fetchProducts();
    fetchSizes();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/products");
      setProducts(res.data);
    } catch {
      showError("Lỗi tải danh sách sản phẩm!");
    }
  };

  const fetchSizes = async () => {
    try {
      const res = await axios.get("/api/sizes");
      setSizes(res.data);
    } catch {
      showError("Lỗi tải danh sách size!");
    }
  };

  const fetchProductSizes = async (productId) => {
    try {
      const res = await axios.get(`/api/product-sizes/${productId}`);
      setProductSizes(res.data);
    } catch {
      showError("Lỗi tải size của sản phẩm!");
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    if (productId) fetchProductSizes(productId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct || !formData.size_id) {
      showError("Vui lòng chọn sản phẩm và size!");
      return;
    }

    try {
      await axios.post(
        "/api/product-sizes",
        { ...formData, product_id: selectedProduct },
        { headers: getAuthHeaders() }
      );
      showSuccess("Đã gắn size cho sản phẩm!");
      fetchProductSizes(selectedProduct);
      setFormData({ size_id: "", stock_quantity: 0 });
    } catch {
      showError("Lỗi khi thêm size cho sản phẩm!");
    }
  };

  const handleDelete = (id) => {
    showConfirm("Bạn có chắc muốn xóa size này khỏi sản phẩm?", async () => {
      try {
        await axios.delete(`/api/product-sizes/${id}`, {
          headers: getAuthHeaders(),
        });
        showSuccess("Đã xóa size khỏi sản phẩm!");
        fetchProductSizes(selectedProduct);
      } catch {
        showError("Lỗi khi xóa size sản phẩm!");
      }
    });
  };

  return (
    <AdminLayout>
      <h2>📦 Quản lý Size theo Sản phẩm</h2>

      {/* Chọn sản phẩm */}
      <div className="mb-3">
        <label className="form-label">Chọn sản phẩm:</label>
        <select
          className="form-select"
          value={selectedProduct || ""}
          onChange={handleProductChange}
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Form gắn size */}
      {selectedProduct && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="row g-2">
            <div className="col-md-5">
              <select
                className="form-select"
                value={formData.size_id}
                onChange={(e) =>
                  setFormData({ ...formData, size_id: e.target.value })
                }
              >
                <option value="">-- Chọn size --</option>
                {sizes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                placeholder="Tồn kho"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-admin-primary w-100">
                ➕ Thêm
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Danh sách size của sản phẩm */}
      {selectedProduct && (
        <div className="admin-table">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Size</th>
                <th>Tồn kho</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {productSizes.map((ps, idx) => (
                <tr key={ps.id}>
                  <td>{idx + 1}</td>
                  <td>{ps.name}</td>
                  <td>{ps.stock_quantity}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(ps.id)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {productSizes.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center">
                    Chưa có size nào cho sản phẩm này
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductSizes;
