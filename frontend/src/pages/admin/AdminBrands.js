import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    logo: '',
    website: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get('/api/brands/admin');
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        status: formData.status || 'active',
        logo: formData.logo || '',
        website: formData.website || ''
      };

      if (editingBrand) {
        await axios.put(`/api/brands/${editingBrand.id}`, dataToSubmit);
        alert('Cập nhật thương hiệu thành công!');
      } else {
        await axios.post('/api/brands', dataToSubmit);
        alert('Thêm thương hiệu thành công!');
      }
      
      setShowModal(false);
      setEditingBrand(null);
      resetForm();
      fetchBrands();
    } catch (error) {
      console.error('Error saving brand:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      description: brand.description || '',
      logo: brand.logo || '',
      website: brand.website || '',
      status: brand.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa thương hiệu này?')) {
      try {
        await axios.delete(`/api/brands/${id}`);
        alert('Xóa thương hiệu thành công!');
        fetchBrands();
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Có lỗi xảy ra!');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      website: '',
      status: 'active'
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingBrand(null);
    resetForm();
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🏷️ Quản lý thương hiệu</h2>
        <button 
          className="btn btn-admin-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Thêm thương hiệu
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
                <th>Logo</th>
                <th>Tên thương hiệu</th>
                <th>Slug</th>
                <th>Website</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
      {[...brands]
        .sort((a, b) => a.id - b.id)
        .map(brand => (                
              <tr key={brand.id}>
                  <td>{brand.id}</td>
                  <td>
                    {brand.logo ? (
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        className="rounded"
                      />
                    ) : (
                      <div className="bg-light rounded d-flex align-items-center justify-content-center" 
                           style={{ width: '40px', height: '40px' }}>
                        🏷️
                      </div>
                    )}
                  </td>
                  <td>{brand.name}</td>
                  <td><code>{brand.slug}</code></td>
                  <td>
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {brand.website}
                      </a>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${brand.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {brand.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>
                    {new Date(brand.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(brand)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(brand.id)}
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBrand ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleModalClose}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tên thương hiệu:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Slug:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        placeholder="Tự động tạo nếu để trống"
                      />
                    </div>
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
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">URL Logo:</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.logo}
                        onChange={(e) => setFormData({...formData, logo: e.target.value})}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Website:</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Trạng thái:</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Tạm dừng</option>
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
                    {editingBrand ? 'Cập nhật' : 'Thêm'}
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

export default AdminBrands;
