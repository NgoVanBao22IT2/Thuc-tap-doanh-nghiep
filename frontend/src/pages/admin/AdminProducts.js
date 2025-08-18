import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import axios from "axios";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sale_price: "", // Thêm trường sale_price
    stock_quantity: "",
    category_id: "",
    brand_id: "",
    image_url: "",
    sku: "",
    slug: "",
    status: "active",
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/api/products");
      const allProducts = response.data;

      // Filter by search term
      const filteredProducts = searchTerm
        ? allProducts.filter(
            (product) =>
              product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.sku.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : allProducts;

      // Calculate pagination
      const totalItems = filteredProducts.length;
      const totalPagesCount = Math.ceil(totalItems / itemsPerPage);
      setTotalPages(totalPagesCount);

      // Get current page items
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const currentProducts = filteredProducts.slice(startIndex, endIndex);

      setProducts(currentProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get("/api/brands");
      setBrands(response.data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  // Thêm hàm lấy token
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token"); // hoặc nơi bạn lưu token
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.price ||
      !formData.stock_quantity ||
      !formData.category_id ||
      !formData.sku
    ) {
      showError("Vui lòng nhập đầy đủ các trường bắt buộc!");
      return;
    }
    try {
      // Chuẩn hóa dữ liệu gửi lên backend
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price
          ? parseFloat(formData.sale_price)
          : null,
        stock_quantity: parseInt(formData.stock_quantity),
        category_id: parseInt(formData.category_id),
        brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
        status: formData.status || "active",
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        sku: formData.sku || `SKU-${Date.now()}`,
      
      };

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct.id}`, dataToSend, {
          headers: getAuthHeaders(),
        });
        showSuccess("Cập nhật sản phẩm thành công!");
      } else {
        await axios.post("/api/products", dataToSend, {
          headers: getAuthHeaders(),
        });
        showSuccess("Thêm sản phẩm thành công!");
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showError(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      sale_price: product.sale_price || "", // Thêm trường sale_price
      stock_quantity: product.stock_quantity,
      category_id: product.category_id,
      brand_id: product.brand_id || "",
      image_url: product.image_url || "",
      sku: product.sku || "",
      slug: product.slug || "",
      status: product.status || "active",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!id || isNaN(Number(id))) {
      showError("ID sản phẩm không hợp lệ!");
      return;
    }

    showConfirm("Bạn có chắc muốn xóa sản phẩm này?", async () => {
      try {
        await axios.delete(`/api/products/${id}`, {
          headers: getAuthHeaders(),
        });
        showSuccess("Xóa sản phẩm thành công!");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        showError(error.response?.data?.message || "Có lỗi xảy ra!");
      }
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      sale_price: "", // Thêm trường sale_price
      stock_quantity: "",
      category_id: "",
      brand_id: "",
      image_url: "",
      sku: "",
      slug: "",
      status: "active",
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingProduct(null);
    resetForm();
  };

  return (
    <>
      <AdminLayout>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>📦 Quản lý sản phẩm</h2>
          <button
            className="btn btn-admin-primary"
            onClick={() => setShowModal(true)}
          >
            ➕ Thêm sản phẩm
          </button>
        </div>

        {/* Search and Filter */}
        <div className="row mb-3">
          <div className="col-md-6">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm kiếm theo tên hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearchTerm("")}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>

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
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Giá sale</th> {/* Thêm cột Giá sale */}
                  <th>Tồn kho</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>
                      <img
                        src={
                          product.image_url ||
                          "https://via.placeholder.com/50x50"
                        }
                        alt={product.name}
                        style={{
                          width: "50px",
                          height: "50px",
                          objectFit: "cover",
                        }}
                        className="rounded"
                      />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category_name}</td>
                    <td>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(product.price)}
                    </td>
                    <td>
                      {product.sale_price ? (
                        <span className="text-danger fw-bold">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(product.sale_price)}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{product.stock_quantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(product)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Product pagination" className="mt-4">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Trước
                </button>
              </li>

              {(() => {
                const pages = [];
                const maxVisible = 3;

                if (totalPages <= maxVisible) {
                  // Nếu tổng số trang <= 3, hiển thị tất cả
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(
                      <li
                        key={i}
                        className={`page-item ${
                          currentPage === i ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(i)}
                        >
                          {i}
                        </button>
                      </li>
                    );
                  }
                } else {
                  // Logic phức tạp hơn cho nhiều trang
                  if (currentPage <= 3) {
                    // Hiển thị 1,2,3
                    for (let i = 1; i <= 3; i++) {
                      pages.push(
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(i)}
                          >
                            {i}
                          </button>
                        </li>
                      );
                    }
                    if (totalPages > 3) {
                      pages.push(
                        <li key="ellipsis-end" className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      );
                      pages.push(
                        <li key={totalPages} className="page-item">
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      );
                    }
                  } else if (currentPage >= totalPages - 2) {
                    // Hiển thị trang đầu, ..., và 5 trang cuối
                    pages.push(
                      <li key={1} className="page-item">
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                      </li>
                    );
                    pages.push(
                      <li key="ellipsis-start" className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(i)}
                          >
                            {i}
                          </button>
                        </li>
                      );
                    }
                  } else {
                    // Hiển thị trang đầu, ..., current-1, current, current+1, ..., trang cuối
                    pages.push(
                      <li key={1} className="page-item">
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(1)}
                        >
                          1
                        </button>
                      </li>
                    );
                    pages.push(
                      <li key="ellipsis-start" className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(
                        <li
                          key={i}
                          className={`page-item ${
                            currentPage === i ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(i)}
                          >
                            {i}
                          </button>
                        </li>
                      );
                    }
                    pages.push(
                      <li key="ellipsis-end" className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                    pages.push(
                      <li key={totalPages} className="page-item">
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(totalPages)}
                        >
                          {totalPages}
                        </button>
                      </li>
                    );
                  }
                }

                return pages;
              })()}

              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </button>
              </li>
            </ul>
          </nav>
        )}

        {/* Modal with admin styling */}
        {showModal && (
          <div className="modal show d-block admin-modal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleModalClose}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Tên sản phẩm:</label>
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

                    <div className="mb-3">
                      <label className="form-label">Mô tả:</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Giá:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Giá sale:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.sale_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sale_price: e.target.value,
                            })
                          }
                          placeholder="Nhập giá sale nếu có"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Tồn kho:</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.stock_quantity}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              stock_quantity: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Danh mục:</label>
                        <select
                          className="form-select"
                          value={formData.category_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category_id: e.target.value,
                            })
                          }
                          required
                        >
                          <option value="">Chọn danh mục</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Thương hiệu:</label>
                      <select
                        className="form-select"
                        value={formData.brand_id}
                        onChange={(e) =>
                          setFormData({ ...formData, brand_id: e.target.value })
                        }
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">SKU:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.sku}
                        onChange={(e) =>
                          setFormData({ ...formData, sku: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Slug:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: e.target.value })
                        }
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Trạng thái:</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                      >
                        <option value="active">Kích hoạt</option>
                        <option value="inactive">Không kích hoạt</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">URL hình ảnh:</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image_url: e.target.value,
                          })
                        }
                      />
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
                      {editingProduct ? "Cập nhật" : "Thêm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
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

export default AdminProducts;
