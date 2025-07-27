import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import ImageUpload from '../../components/ImageUpload';
import axios from 'axios';

const AdminSlides = () => {
  const [slides, setSlides] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    button_text: 'Xem ngay',
    sort_order: 0,
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await axios.get('/api/slides/admin');
      setSlides(response.data);
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image) {
      alert('Vui lòng nhập tiêu đề và hình ảnh!');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
        status: formData.status || 'active'
      };

      if (editingSlide) {
        await axios.put(`/api/slides/${editingSlide.id}`, dataToSubmit);
        alert('Cập nhật slide thành công!');
      } else {
        await axios.post('/api/slides', dataToSubmit);
        alert('Thêm slide thành công!');
      }
      
      setShowModal(false);
      setEditingSlide(null);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error('Error saving slide:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description || '',
      image: slide.image,
      link: slide.link || '',
      button_text: slide.button_text || 'Xem ngay',
      sort_order: slide.sort_order || 0,
      status: slide.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa slide này?')) {
      try {
        await axios.delete(`/api/slides/${id}`);
        alert('Xóa slide thành công!');
        fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra!');
      }
    }
  };

  const handleImageUpload = (imageUrl) => {
    setFormData({ ...formData, image: imageUrl });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      button_text: 'Xem ngay',
      sort_order: 0,
      status: 'active'
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSlide(null);
    resetForm();
  };

  const updateSortOrder = async (slideId, newOrder) => {
    try {
      await axios.put(`/api/slides/${slideId}/order`, { sort_order: newOrder });
      fetchSlides();
    } catch (error) {
      console.error('Error updating sort order:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🖼️ Quản lý Slide Banner</h2>
        <button 
          className="btn btn-admin-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Thêm slide
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {slides.map((slide, index) => (
            <div key={slide.id} className="col-lg-4 col-md-6 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="position-relative">
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="card-img-top"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="position-absolute top-0 start-0 m-2">
                    <span className={`badge ${slide.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {slide.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  <div className="position-absolute top-0 end-0 m-2">
                    <span className="badge bg-primary">#{slide.sort_order}</span>
                  </div>
                </div>
                
                <div className="card-body">
                  <h5 className="card-title fw-bold">{slide.title}</h5>
                  <p className="card-text text-muted small">
                    {slide.description || 'Không có mô tả'}
                  </p>
                  
                  <div className="mb-2">
                    <small className="text-muted">
                      <strong>Link:</strong> {slide.link || 'Không có'}
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">
                      <strong>Button:</strong> {slide.button_text}
                    </small>
                  </div>
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleEdit(slide)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(slide.id)}
                    >
                      Xóa
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <small className="text-muted">
                      Thứ tự: 
                      <select 
                        className="form-select form-select-sm d-inline-block w-auto ms-1"
                        value={slide.sort_order}
                        onChange={(e) => updateSortOrder(slide.id, parseInt(e.target.value))}
                      >
                        {slides.map((_, i) => (
                          <option key={i} value={i}>{i + 1}</option>
                        ))}
                      </select>
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block admin-modal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingSlide ? 'Sửa slide' : 'Thêm slide'}
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
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
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
                    label="Hình ảnh slide"
                  />
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Link:</label>
                      <input
                        type="url"
                        className="form-control"
                        value={formData.link}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Text button:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.button_text}
                        onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                        placeholder="Xem ngay"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Thứ tự:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.sort_order}
                        onChange={(e) => setFormData({...formData, sort_order: e.target.value})}
                        min="0"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
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
                    {editingSlide ? 'Cập nhật' : 'Thêm'}
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

export default AdminSlides; 