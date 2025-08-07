import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import { useModal } from '../../hooks/useModal';
import axios from 'axios';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [reply, setReply] = useState('');
  const [showActionModal, setShowActionModal] = useState(false);
  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/admin');
      setReviews(res.data);
    } catch (error) {
      showError('Lỗi khi tải đánh giá!');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reviews/${id}/status`, { status });
      showSuccess('Cập nhật trạng thái thành công!');
      fetchReviews();
    } catch (error) {
      showError('Có lỗi xảy ra!');
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      showError('Vui lòng nhập nội dung phản hồi!');
      return;
    }
    try {
      await axios.put(`/api/reviews/${selectedReview.id}/reply`, { admin_reply: reply });
      showSuccess('Phản hồi thành công!');
      setShowReplyModal(false);
      setReply('');
      setSelectedReview(null);
      fetchReviews();
    } catch (error) {
      showError('Có lỗi xảy ra!');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="badge bg-warning">Chờ duyệt</span>;
      case 'approved': return <span className="badge bg-success">Đã duyệt</span>;
      case 'rejected': return <span className="badge bg-danger">Từ chối</span>;
      default: return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <>
      <AdminLayout>
        <h2 className="mb-4">⭐ Quản lý đánh giá sản phẩm</h2>
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
                  <th>Sản phẩm</th>
                  <th>Người dùng</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Phản hồi admin</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td >{r.product_name}</td>
                    <td>{r.user_name}</td>
                    <td>
                      <span className="text-warning">{'★'.repeat(r.rating)}</span>
                    </td>
                    <td>
                      <div style={{whiteSpace: 'pre-line', width:'350px'}}>{r.content || r.comment}</div>
                    </td>
                    <td>
                      {r.admin_reply ? (
                        <span className="text-success">{r.admin_reply}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td>{new Date(r.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => {
                          setSelectedReview(r);
                          setShowActionModal(true);
                          setReply(r.admin_reply || '');
                        }}
                      >
                        Thao tác
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal thao tác */}
        {showActionModal && selectedReview && (
          <div>
            <div
              className="modal show d-block"
              tabIndex="-1"
              style={{
                zIndex: 1060,
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Thao tác với đánh giá #{selectedReview.id}
                    </h5>
                    <button type="button" className="btn-close" onClick={() => setShowActionModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-2">
                      <strong>Sản phẩm:</strong> {selectedReview.product_name}
                    </div>
                    <div className="mb-2">
                      <strong>Người dùng:</strong> {selectedReview.user_name}
                    </div>
                    <div className="mb-2">
                      <strong>Đánh giá:</strong> <span className="text-warning">{'★'.repeat(selectedReview.rating)}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Nội dung đánh giá:</strong>
                      <div className="bg-light p-2 rounded" style={{whiteSpace: 'pre-line', }}>{selectedReview.content}</div>
                    </div>
                    <div className="mb-2">
                      <strong>Phản hồi admin:</strong>
                      <div className="bg-light p-2 rounded" style={{whiteSpace: 'pre-line'}}>
                        {selectedReview.admin_reply || <span className="text-muted">Chưa có</span>}
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>Trạng thái:</strong> {getStatusBadge(selectedReview.status)}
                    </div>
                    {/* Phản hồi */}
                    <div className="mb-2">
                      <label className="form-label">Phản hồi admin:</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        placeholder="Nhập phản hồi cho đánh giá này..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer d-flex flex-wrap gap-2">
                    {selectedReview.status === 'pending' && (
                      <>
                        <button className="btn btn-success" onClick={async () => { await updateStatus(selectedReview.id, 'approved'); setShowActionModal(false); }}>Duyệt</button>
                        <button className="btn btn-danger" onClick={async () => { await updateStatus(selectedReview.id, 'rejected'); setShowActionModal(false); }}>Từ chối</button>
                      </>
                    )}
                    <button className="btn btn-primary" onClick={async () => { await handleReply(); setShowActionModal(false); }}>Gửi phản hồi</button>
                    <button className="btn btn-secondary" onClick={() => setShowActionModal(false)}>Đóng</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-backdrop show"></div>
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



export default AdminReviews;
