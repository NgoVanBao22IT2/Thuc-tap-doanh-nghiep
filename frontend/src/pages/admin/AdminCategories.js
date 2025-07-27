import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';
import ImageUpload from '../../components/ImageUpload';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        status: formData.status || 'active'
      };

      if (editingCategory) {
        await axios.put(`/api/categories/${editingCategory.id}`, dataToSend);
        alert('Cập nhật danh mục thành công!');
      } else {
        await axios.post('/api/categories', dataToSend);
        alert('Thêm danh mục thành công!');
      }
      
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      slug: category.slug || '',
      image: category.image || '',
      status: category.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await axios.delete(`/api/categories/${id}`);
        alert('Xóa danh mục thành công!');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Có lỗi xảy ra!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      slug: '',
      image: '',
      status: 'active'
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl });
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📂 Quản lý danh mục</h2>
        <button 
          className="btn btn-admin-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Thêm danh mục
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
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>ảnh</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>{category.name}</td>
                  <td>{category.description}</td>
                  <td><img 
                      src={category.image || 'https://via.placeholder.com/50x50'} 
                      alt={category.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="rounded"
                    /></td>
                  <td>
                    {new Date(category.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(category)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(category.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block admin-modal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
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
                    <label className="form-label">Tên danh mục:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Mô tả:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <ImageUpload
                    onImageUpload={handleImageUpload}
                    currentImage={formData.image}
                    label="Ảnh danh mục"
                  />

                  <div className="mb-3">
                    <label className="form-label">Slug:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Trạng thái:</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Kích hoạt</option>
                      <option value="inactive">Không kích hoạt</option>
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
                    {editingCategory ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop show"></div>}
    </AdminLayout>
  );
};

export default AdminCategories;
