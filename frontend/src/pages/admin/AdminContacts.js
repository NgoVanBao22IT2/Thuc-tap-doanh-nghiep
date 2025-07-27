import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reply, setReply] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get('/api/contacts/admin');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (contactId, status) => {
    try {
      await axios.put(`/api/contacts/${contactId}/status`, { status });
      alert('Cập nhật trạng thái thành công!');
      fetchContacts();
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      alert('Vui lòng nhập nội dung trả lời!');
      return;
    }

    try {
      await axios.put(`/api/contacts/${selectedContact.id}/reply`, { 
        admin_reply: reply,
        status: 'resolved'
      });
      alert('Trả lời thành công!');
      setShowModal(false);
      setReply('');
      setSelectedContact(null);
      fetchContacts();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new': return 'bg-primary';
      case 'processing': return 'bg-warning';
      case 'resolved': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'new': return 'Mới';
      case 'processing': return 'Đang xử lý';
      case 'resolved': return 'Đã giải quyết';
      default: return status;
    }
  };

  return (
    <AdminLayout>
      <h2 className="mb-4">📞 Quản lý liên hệ</h2>

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
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Chủ đề</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr key={contact.id}>
                  <td>{contact.id}</td>
                  <td>{contact.name}</td>
                  <td>{contact.email}</td>
                  <td>{contact.phone || 'Chưa có'}</td>
                  <td>
                    <span className="text-truncate d-inline-block" style={{maxWidth: '200px'}}>
                      {contact.subject}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(contact.status)}`}>
                      {getStatusText(contact.status)}
                    </span>
                  </td>
                  <td>
                    {new Date(contact.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <div className="dropdown">
                      <button 
                        className="btn btn-sm btn-outline-primary dropdown-toggle" 
                        type="button" 
                        data-bs-toggle="dropdown"
                      >
                        Thao tác
                      </button>
                      <ul className="dropdown-menu">
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedContact(contact);
                              setShowModal(true);
                            }}
                          >
                            Xem chi tiết & Trả lời
                          </button>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => updateContactStatus(contact.id, 'processing')}
                            disabled={contact.status === 'resolved'}
                          >
                            Đánh dấu đang xử lý
                          </button>
                        </li>
                        <li>
                          <button 
                            className="dropdown-item"
                            onClick={() => updateContactStatus(contact.id, 'resolved')}
                            disabled={contact.status === 'resolved'}
                          >
                            Đánh dấu đã giải quyết
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedContact && (
        <div className="modal show d-block admin-modal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Chi tiết liên hệ</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedContact(null);
                    setReply('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Họ tên:</strong> {selectedContact.name}
                  </div>
                  <div className="col-md-6">
                    <strong>Email:</strong> {selectedContact.email}
                  </div>
                </div>
                
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Số điện thoại:</strong> {selectedContact.phone || 'Chưa có'}
                  </div>
                  <div className="col-md-6">
                    <strong>Trạng thái:</strong>{' '}
                    <span className={`badge ${getStatusBadgeClass(selectedContact.status)}`}>
                      {getStatusText(selectedContact.status)}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <strong>Chủ đề:</strong>
                  <div className="mt-1">{selectedContact.subject}</div>
                </div>

                <div className="mb-3">
                  <strong>Nội dung:</strong>
                  <div className="mt-1 p-3 bg-light rounded">
                    {selectedContact.message}
                  </div>
                </div>

                {selectedContact.admin_reply && (
                  <div className="mb-3">
                    <strong>Phản hồi của admin:</strong>
                    <div className="mt-1 p-3 bg-primary text-white rounded">
                      {selectedContact.admin_reply}
                    </div>
                  </div>
                )}

                {selectedContact.status !== 'resolved' && (
                  <div className="mb-3">
                    <label className="form-label"><strong>Trả lời:</strong></label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Nhập phản hồi cho khách hàng..."
                    />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedContact(null);
                    setReply('');
                  }}
                >
                  Đóng
                </button>
                {selectedContact.status !== 'resolved' && (
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={handleReply}
                  >
                    Gửi phản hồi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop show"></div>}
    </AdminLayout>
  );
};

export default AdminContacts;
