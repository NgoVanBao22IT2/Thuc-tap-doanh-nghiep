import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import { useModal } from '../../hooks/useModal';
import axios from 'axios';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN');
};

const initialForm = {
  title: '',
  content: '',
  image: '',
  category: '',
  author: '',
  status: 'draft'
};

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Lấy tất cả tin tức (admin)
      const res = await axios.get('/api/news/admin/all');
      setNews(res.data);
    } catch (err) {
      setNews([]);
      console.error('Lỗi lấy tin tức:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setForm(initialForm);
    setEditingNews(null);
    setShowModal(true);
    setMessage('');
  };

  const handleEdit = (item) => {
    setForm({
      title: item.title,
      content: item.content || '',
      image: item.image || '',
      category: item.category || '',
      author: item.author || '',
      status: item.status || 'draft'
    });
    setEditingNews(item);
    setShowModal(true);
    setMessage('');
  };

  const handleDelete = (id) => {
    showConfirm(
      'Bạn có chắc muốn xóa tin tức này?',
      async () => {
        try {
          await axios.delete(`/api/news/${id}`);
          showSuccess('Đã xóa tin tức.');
          fetchNews();
        } catch {
          showError('Có lỗi khi xóa.');
        }
      }
    );
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingNews(null);
    setForm(initialForm);
    setMessage('');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title || !form.content) {
      setMessage('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }
    try {
      // Lấy token nếu cần xác thực (nếu backend yêu cầu)
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (editingNews) {
        await axios.put(`/api/news/${editingNews.id}`, form, { headers });
        showSuccess('Cập nhật tin tức thành công!');
      } else {
        await axios.post('/api/news', form, { headers });
        showSuccess('Thêm tin tức thành công!');
      }
      setShowModal(false);
      setEditingNews(null);
      setForm(initialForm);
      fetchNews();
    } catch {
      setMessage('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  return (
    <>
      <AdminLayout>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-newspaper me-2"></i>
            Quản lý tin tức
          </h2>
          <button
            className="btn btn-admin-primary"
            onClick={handleAddClick}
          >
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
                  <th>Nội dung</th>
                  <th>Tác giả</th>
                  <th>Ảnh</th>
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
                  news.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.title}</td>
                      <td>{item.category}</td>
                      <td>{item.content}</td>
                      <td>{item.author}</td>
                      <td>
                        {item.image ? (
                          <img 
                        src={item.image || 'https://via.placeholder.com/50x50'} 
                        alt={item.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                      />
                        ) : (
                           <img 
                        src={item.image || 'https://via.placeholder.com/50x50'} 
                        alt={item.title}
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        className="rounded"
                          />
                        )}
                      </td>
                      <td>
                        <span className={`badge bg-${item.status === 'published' ? 'success' : 'secondary'}`}>
                          {item.status === 'published' ? 'Đã đăng' : 'Nháp'}
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
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingNews ? 'Sửa tin tức' : 'Thêm tin tức'}
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
                      <label className="form-label">Nội dung:</label>
                      <textarea
                        className="form-control"
                        name="content"
                        value={form.content}
                        onChange={handleChange}
                        rows={4}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Ảnh (URL):</label>
                      <input
                        className="form-control"
                        name="image"
                        value={form.image}
                        onChange={handleChange}
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
                    {message && (
                      <div className="alert alert-info py-2 mb-0">{message}</div>
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
                      {editingNews ? 'Cập nhật' : 'Thêm'}
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
