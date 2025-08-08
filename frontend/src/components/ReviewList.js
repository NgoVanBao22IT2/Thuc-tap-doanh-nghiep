import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const ReviewList = ({ productId, refreshTrigger }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');

  const fetchReviews = useCallback(async () => {
    try {
      const response = await axios.get(`/api/reviews/product/${productId}`, {
        params: { page, sort: sortBy, limit: 5 }
      });
      
      setReviews(response.data.reviews);
      setSummary(response.data.summary);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Set default data if API fails
      setReviews([]);
      setSummary({ total_reviews: 0, average_rating: 0 });
    } finally {
      setLoading(false);
    }
  }, [productId, page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshTrigger]);

  // Lọc lại ở frontend nếu backend chưa lọc (chỉ giữ review đã duyệt)
  const approvedReviews = reviews.filter(r => r.status === 'approved' || !r.status);

  const handleHelpful = async (reviewId, isHelpful) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đánh giá');
      return;
    }
    
    try {
      await axios.post(`/api/reviews/${reviewId}/helpful`, { is_helpful: isHelpful });
      fetchReviews(); // Refresh to show updated counts
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <i
        key={index}
        className={`bi ${index < rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
        style={{ fontSize: '0.9rem' }}
      ></i>
    ));
  };

  const renderRatingSummary = () => {
    if (!summary || summary.total_reviews === 0) return null;
    
    const avgRating = parseFloat(summary.average_rating).toFixed(1);
    const total = parseInt(summary.total_reviews);
    
    return (
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <div className="display-4 fw-bold text-warning">{avgRating}</div>
              <div className="mb-2">{renderStars(Math.round(avgRating))}</div>
              <div className="text-muted">{total} đánh giá</div>
            </div>
            <div className="col-md-8">
              {[5, 4, 3, 2, 1].map(star => {
                const count = parseInt(summary[`${['', 'one', 'two', 'three', 'four', 'five'][star]}_star`]) || 0;
                const percentage = total > 0 ? (count / total * 100) : 0;
                
                return (
                  <div key={star} className="d-flex align-items-center mb-1">
                    <span className="me-2" style={{ minWidth: '60px' }}>
                      {star} <i className="bi bi-star-fill text-warning"></i>
                    </span>
                    <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar bg-warning" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-muted small" style={{ minWidth: '40px' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {renderRatingSummary()}
      
      {approvedReviews.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Đánh giá từ khách hàng</h5>
          <select 
            className="form-select w-auto"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
          </select>
        </div>
      )}
      
      {approvedReviews.length === 0 ? (
        <div className="text-center py-4">
          <i className="bi bi-chat-quote display-1 text-muted"></i>
          <h5 className="text-muted mt-3">Chưa có đánh giá nào</h5>
          <p className="text-muted">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
        </div>
      ) : (
        <>
          {approvedReviews.map(review => (
            <div key={review.id} className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex align-items-center">
                    <img src={review.avatar 
                    ? `${process.env.REACT_APP_API_URL}${review.avatar}` 
                    : 'https://via.placeholder.com/40x40?text=U'
                    }                       
                    alt={review.user_name}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="fw-medium">{review.name}</div>
                      <div className="d-flex align-items-center">
                        {renderStars(review.rating)}
                        {review.verified_purchase && (
                          <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>
                            <i className="bi bi-patch-check me-1"></i>
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <small className="text-muted">
                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                  </small>
                </div>
                
                {review.title && (
                  <h6 className="fw-medium mb-2">{review.title}</h6>
                )}
                
                <p className="mb-3">{review.content || review.comment}</p>
                
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-success btn-sm"
                      onClick={() => handleHelpful(review.id, true)}
                      disabled={!currentUser}
                    >
                      <i className="bi bi-hand-thumbs-up me-1"></i>
                      Hữu ích ({review.helpful_count || 0})
                    </button>
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => handleHelpful(review.id, false)}
                      disabled={!currentUser}
                    >
                      <i className="bi bi-hand-thumbs-down me-1"></i>
                      Không hữu ích ({review.unhelpful_count || 0})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {totalPages > 1 && (
            <nav className="d-flex justify-content-center mt-4">
              <ul className="pagination">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Trước
                  </button>
                </li>
                
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i + 1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Sau
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ReviewList;
