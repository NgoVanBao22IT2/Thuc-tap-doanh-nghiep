import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import Modal from "../../components/Modal";
import { useModal } from "../../hooks/useModal";
import axios from "axios";

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
};

const initialForm = {
  title: "",
  blocks: [],
  category: "",
  author: "",
  status: "draft",
};

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Lấy tất cả tin tức (admin)
      const res = await axios.get("/api/news/admin/all");
      setNews(res.data);
    } catch (err) {
      setNews([]);
      console.error("Lỗi lấy tin tức:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setForm(initialForm);
    setEditingNews(null);
    setShowModal(true);
    setMessage("");
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      blocks:
        item.blocks ||
        [
          { type: "text", content: item.content || "" },
          item.image ? { type: "image", src: item.image } : null,
        ].filter(Boolean),
      category: item.category || "",
      author: item.author || "",
      status: item.status || "draft",
    });
    setEditingNews(item);
    setShowModal(true);
    setMessage("");
  };

  const handleDelete = (id) => {
    showConfirm("Bạn có chắc muốn xóa tin tức này?", async () => {
      try {
        await axios.delete(`/api/news/${id}`);
        showSuccess("Đã xóa tin tức.");
        fetchNews();
      } catch {
        showError("Có lỗi khi xóa.");
      }
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingNews(null);
    setForm(initialForm);
    setMessage("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Thêm/xóa/sửa khối nội dung/ảnh
  const handleBlockChange = (idx, field, value) => {
    const blocks = [...form.blocks];
    blocks[idx][field] = value;
    setForm({ ...form, blocks });
  };

  const handleAddBlock = (type) => {
    setForm({
      ...form,
      blocks: [
        ...form.blocks,
        type === "text"
          ? { type: "text", content: "" }
          : { type: "image", src: "" },
      ],
    });
  };

  const handleRemoveBlock = (idx) => {
    const blocks = [...form.blocks];
    blocks.splice(idx, 1);
    setForm({ ...form, blocks });
  };

  const handleMoveBlock = (idx, dir) => {
    const blocks = [...form.blocks];
    if (dir === "up" && idx > 0) {
      [blocks[idx - 1], blocks[idx]] = [blocks[idx], blocks[idx - 1]];
    }
    if (dir === "down" && idx < blocks.length - 1) {
      [blocks[idx], blocks[idx + 1]] = [blocks[idx + 1], blocks[idx]];
    }
    setForm({ ...form, blocks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || form.blocks.length === 0) {
      setMessage("Vui lòng nhập tiêu đề và ít nhất một khối nội dung.");
      return;
    }
    try {
      // Lấy token nếu cần xác thực (nếu backend yêu cầu)
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const payload = {
        title: form.title,
        blocks: form.blocks,
        category: form.category,
        author: form.author,
        status: form.status,
      };
      if (editingNews) {
        await axios.put(`/api/news/${editingNews.id}`, payload, { headers });
        showSuccess("Cập nhật tin tức thành công!");
      } else {
        await axios.post("/api/news", payload, { headers });
        showSuccess("Thêm tin tức thành công!");
      }
      setShowModal(false);
      setEditingNews(null);
      setForm(initialForm);
      fetchNews();
    } catch {
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  // Hiển thị tóm tắt blocks cho bảng
  const renderBlocksSummary = (blocks) => {
    if (!blocks || blocks.length === 0) return "";
    return blocks.map((block, idx) =>
      block.type === "text" ? (
        <span
          key={idx}
          className="d-block text-truncate"
          style={{ maxWidth: 180 }}
        >
          {block.content.slice(0, 60)}
          {block.content.length > 60 ? "..." : ""}
        </span>
      ) : block.type === "image" ? (
        <img
          key={idx}
          src={block.src}
          alt=""
          style={{
            width: 40,
            height: 28,
            objectFit: "cover",
            borderRadius: 3,
            marginRight: 6,
          }}
        />
      ) : null
    );
  };

  return (
    <>
      <AdminLayout>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-newspaper me-2"></i>
            Quản lý tin tức
          </h2>
          <button className="btn btn-admin-primary" onClick={handleAddClick}>
            ➕ Thêm tin tức
          </button>
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
                  <th>Tiêu đề</th>
                  <th>Chuyên mục</th>
                  <th>Nội dung</th>
                  <th>Tác giả</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {news.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      Chưa có tin tức nào.
                    </td>
                  </tr>
                ) : (
                  news.map((item) => (
                    <tr key={item.id} >
                      <td>{item.id}</td>
                      <td style={{ width:'200px'}}>{item.title}</td>
                      <td>{item.category}</td>
                      
                      <td>{renderBlocksSummary(item.blocks)}</td>
                      <td>{item.author}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            item.status === "published"
                              ? "success"
                              : "secondary"
                          }`}
                        >
                          {item.status === "published" ? "Đã đăng" : "Nháp"}
                        </span>
                      </td>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(item)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal thêm/sửa tin tức */}
        {showModal && (
          <div className="modal show d-block admin-modal" tabIndex="-1">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingNews ? "Sửa tin tức" : "Thêm tin tức"}
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
                      <label className="form-label">Tiêu đề:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Chuyên mục:</label>
                      <input
                        className="form-control"
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                      />
                    </div>
                    
                    
                    <div className="mb-3">
                      <label className="form-label">Tác giả:</label>
                      <input
                        className="form-control"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Trạng thái:</label>
                      <select
                        className="form-select"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="draft">Nháp</option>
                        <option value="published">Đã đăng</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Nội dung & Ảnh:</label>
                      {form.blocks.map((block, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center mb-2"
                        >
                          <select
                            className="form-select form-select-sm w-auto me-2"
                            value={block.type}
                            onChange={(e) =>
                              handleBlockChange(idx, "type", e.target.value)
                            }
                          >
                            <option value="text">Nội dung</option>
                            <option value="image">Ảnh</option>
                          </select>
                          {block.type === "text" ? (
                            <textarea
                              className="form-control me-2"
                              rows={2}
                              value={block.content}
                              onChange={(e) =>
                                handleBlockChange(
                                  idx,
                                  "content",
                                  e.target.value
                                )
                              }
                              placeholder="Nhập nội dung..."
                              required
                            />
                          ) : (
                            <input
                              className="form-control me-2"
                              type="url"
                              value={block.src}
                              onChange={(e) =>
                                handleBlockChange(idx, "src", e.target.value)
                              }
                              placeholder="URL ảnh..."
                              required
                            />
                          )}
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => handleMoveBlock(idx, "up")}
                            disabled={idx === 0}
                            title="Lên"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary me-1"
                            onClick={() => handleMoveBlock(idx, "down")}
                            disabled={idx === form.blocks.length - 1}
                            title="Xuống"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveBlock(idx)}
                            title="Xóa khối"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleAddBlock("text")}
                        >
                          + Nội dung
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-info"
                          onClick={() => handleAddBlock("image")}
                        >
                          + Ảnh
                        </button>
                      </div>
                    </div>
                    {message && (
                      <div className="alert alert-info py-2 mb-0">
                        {message}
                      </div>
                    )}
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
                      {editingNews ? "Cập nhật" : "Thêm"}
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
    </>
  );
};

export default AdminNews;
