import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';
import { useModal } from '../hooks/useModal';
import axios from 'axios';

const ReviewForm = ({ product, onReviewSubmitted }) => {
  const { currentUser } = useAuth();
  const { modal, hideModal, showSuccess, showError } = useModal();
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      showError('Vui lòng đăng nhập để đánh giá sản phẩm');
      return;
    }
    
    if (!formData.comment.trim()) {
      showError('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post('/api/reviews', {
        product_id: product.id,
        ...formData
      });
      
      showSuccess('Đánh giá của bạn đã được gửi và đang chờ duyệt!');
      setFormData({
        rating: 5,
        title: '',
        comment: '',
        images: []
      });
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      showError(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, onStarClick) => {
    return [...Array(5)].map((_, index) => (
      <button
        key={index}
        type="button"
        className={`btn btn-link p-0 me-1 ${index < rating ? 'text-warning' : 'text-muted'}`}
        onClick={() => onStarClick && onStarClick(index + 1)}
        style={{ fontSize: '1.5rem', lineHeight: 1 }}
      >
        <i className={`bi ${index < rating ? 'bi-star-fill' : 'bi-star'}`}></i>
      </button>
    ));
  };

  if (!currentUser) {
    return (
      <>
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          Vui lòng <a href="/login" className="alert-link">đăng nhập</a> để đánh giá sản phẩm này.
        </div>
        
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
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-star me-2"></i>
            Viết đánh giá
          </h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Đánh giá của bạn:</label>
              <div className="d-flex align-items-center">
                {renderStars(formData.rating, (rating) => setFormData({...formData, rating}))}
                <span className="ms-2 text-muted">({formData.rating} sao)</span>
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Tiêu đề (tùy chọn):</label>
              <input
                type="text"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Tóm tắt ngắn gọn về đánh giá của bạn"
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Nội dung đánh giá <span className="text-danger">*</span>:</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.comment}
                onChange={(e) => setFormData({...formData, comment: e.target.value})}
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                required
              />
            </div>
            
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Đánh giá sẽ được hiển thị sau khi được duyệt
              </small>
              <button 
                type="submit" 
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
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

export default ReviewForm;
