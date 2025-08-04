import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import { useModal } from '../../hooks/useModal';
import axios from 'axios';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  });
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const { modal, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    fetchUsers();
    // Giả lập thông tin người dùng hiện tại (current user)
    setCurrentUser({
      id: 1,
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active'
    });
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users/admin');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole });
      alert('Cập nhật vai trò thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const deleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      showError('Bạn không thể xóa tài khoản của chính mình!');
      return;
    }

    showConfirm(
      'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!',
      async () => {
        try {
          await axios.delete(`/api/users/${userId}`);
          showSuccess('Xóa người dùng thành công!');
          fetchUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          showError(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
      }
    );
  };

  const updateUserStatus = async (userId, newStatus) => {
    if (userId === currentUser?.id) {
      showError('Bạn không thể thay đổi trạng thái tài khoản của chính mình!');
      return;
    }

    const statusText = {
      'active': 'kích hoạt',
      'inactive': 'tạm dừng', 
      'blocked': 'khóa'
    };

    showConfirm(
      `Bạn có chắc muốn ${statusText[newStatus]} tài khoản này?`,
      async () => {
        try {
          await axios.put(`/api/users/${userId}/status`, { status: newStatus });
          showSuccess('Cập nhật trạng thái tài khoản thành công!');
          fetchUsers();
        } catch (error) {
          console.error('Error updating user status:', error);
          showError(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.role) {
      showError('Vui lòng nhập đầy đủ các trường bắt buộc!');
      return;
    }

    if (!editingUser && !formData.password) {
      showError('Vui lòng nhập mật khẩu cho người dùng mới!');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        password: editingUser ? undefined : formData.password
      };

      if (editingUser) {
        await axios.put(`/api/users/${editingUser.id}`, dataToSubmit);
        showSuccess('Cập nhật người dùng thành công!');
      } else {
        await axios.post('/api/users', dataToSubmit);
        showSuccess('Thêm người dùng thành công!');
      }
      
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      password: ''
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingUser(null);
    resetForm();
  };

  const openActionModal = (user) => {
    setSelectedUser(user);
    setShowActionModal(true);
  };

  const closeActionModal = () => {
    setShowActionModal(false);
    setSelectedUser(null);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="badge bg-success">Hoạt động</span>;
      case 'inactive':
        return <span className="badge bg-secondary">Chưa kích hoạt</span>;
      case 'blocked':
        return <span className="badge bg-danger">Bị khóa</span>;
      default:
        return <span className="badge bg-secondary">Không xác định</span>;
    }
  };

  return (
    <>
      <AdminLayout>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>👥 Quản lý người dùng</h2>
          <button 
            className="btn btn-admin-primary"
            onClick={() => setShowModal(true)}
          >
            ➕ Thêm người dùng
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
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng ký</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <img 
                          src={user.avatar || 'https://via.placeholder.com/32x32?text=U'} 
                          alt={user.name}
                          className="rounded-circle me-2"
                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/32x32?text=U';
                          }}
                        />
                        {user.name}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || 'Chưa cập nhật'}</td>
                    <td>
                      <span className={`badge ${user.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                        {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                      </span>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openActionModal(user)}
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

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block admin-modal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}
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
                      <label className="form-label">Họ tên:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Email:</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Số điện thoại:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label">Vai trò:</label>
                      <select
                        className="form-select"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        required
                      >
                        <option value="user">Người dùng</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                    
                    {!editingUser && (
                      <div className="mb-3">
                        <label className="form-label">Mật khẩu:</label>
                        <input
                          type="password"
                          className="form-control"
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          required={!editingUser}
                        />
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
                      {editingUser ? 'Cập nhật' : 'Thêm'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
        {showModal && <div className="modal-backdrop show"></div>}

        {/* Action Modal */}
        {showActionModal && selectedUser && (
          <div>
            <div className="modal show d-block" tabIndex="-1"
              style={{
                zIndex: 1060,
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">
                      Thao tác với người dùng: <strong>{selectedUser.name}</strong>
                    </h5>
                    <button type="button" className="btn-close" onClick={closeActionModal}></button>
                  </div>
                  <div className="modal-body">
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="row">
                        <div className="col-6">
                          <strong>Vai trò hiện tại:</strong> {getStatusBadge(selectedUser.role === 'admin' ? 'admin' : 'user')}
                        </div>
                        <div className="col-6">
                          <strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedUser.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="d-grid gap-2">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => { closeActionModal(); handleEdit(selectedUser); }}
                      >
                        <i className="bi bi-pencil me-2"></i>
                        Sửa thông tin
                      </button>
                      
                      <button
                        className="btn btn-outline-warning"
                        onClick={() => {
                          closeActionModal();
                          updateUserRole(selectedUser.id, selectedUser.role === 'admin' ? 'user' : 'admin');
                        }}
                        disabled={selectedUser.id === currentUser?.id}
                      >
                        <i className="bi bi-arrow-repeat me-2"></i>
                        {selectedUser.role === 'admin' ? 'Chuyển thành User' : 'Chuyển thành Admin'}
                      </button>
                      
                      {/* Status Actions */}
                      {selectedUser.status === 'active' ? (
                        <>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              closeActionModal();
                              updateUserStatus(selectedUser.id, 'inactive');
                            }}
                            disabled={selectedUser.id === currentUser?.id}
                          >
                            <i className="bi bi-pause me-2"></i>
                            Tạm dừng tài khoản
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => {
                              closeActionModal();
                              updateUserStatus(selectedUser.id, 'blocked');
                            }}
                            disabled={selectedUser.id === currentUser?.id}
                          >
                            <i className="bi bi-lock me-2"></i>
                            Khóa tài khoản
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn btn-outline-success"
                          onClick={() => {
                            closeActionModal();
                            updateUserStatus(selectedUser.id, 'active');
                          }}
                          disabled={selectedUser.id === currentUser?.id}
                        >
                          <i className="bi bi-unlock me-2"></i>
                          Kích hoạt tài khoản
                        </button>
                      )}
                      
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => { closeActionModal(); deleteUser(selectedUser.id); }}
                        disabled={selectedUser.id === currentUser?.id}
                      >
                        <i className="bi bi-trash me-2"></i>
                        Xóa người dùng
                      </button>
                    </div>
                    
                    {selectedUser.id === currentUser?.id && (
                      <div className="alert alert-info mt-3 mb-0">
                        <small>
                          <i className="bi bi-info-circle me-1"></i>
                          Bạn không thể thực hiện các thao tác này trên tài khoản của chính mình.
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div
              className="modal-backdrop show"
              style={{
                zIndex: 1050,
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0
              }}
            ></div>
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

export default AdminUsers;
