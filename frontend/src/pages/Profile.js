import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/Modal';
import { useModal } from '../hooks/useModal';
import axios from 'axios';
import dayjs from 'dayjs';

const Profile = () => {
  const { currentUser, logout, updateUser } = useAuth();
  const { modal, hideModal, showSuccess, showError } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: '',
    date_of_birth: '',
    gender: '',
    status: '',
    password: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

 // Thêm hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get('/api/users/me');
      const userData = res.data;
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        address: userData.address || '',
        avatar: userData.avatar || '',
        date_of_birth: userData.date_of_birth
          ? dayjs(userData.date_of_birth).format('YYYY-MM-DD')
          : '',
        gender: userData.gender || '',
        status: userData.status || '',
        password: '',
        confirmPassword: ''
      });
      // Update currentUser context với data mới
      updateUser(userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      // fallback to currentUser
      setFormData({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        address: currentUser?.address || '',
        avatar: currentUser?.avatar || '',
        date_of_birth: currentUser?.date_of_birth
          ? dayjs(currentUser.date_of_birth).format('YYYY-MM-DD')
          : '',
        gender: currentUser?.gender || '',
        status: currentUser?.status || '',
        password: '',
        confirmPassword: ''
      });
      return currentUser;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showError('Vui lòng chọn file hình ảnh!');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showError('File không được vượt quá 5MB!');
        return;
      }

      setAvatarFile(file);
      // Tạo preview tạm thời
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Giải phóng URL khi avatarFile thay đổi hoặc component unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    
    const data = new FormData();
    data.append('avatar', avatarFile);
    
    try {
      const res = await axios.post(`/api/users/${currentUser.id}/avatar`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const newAvatarUrl = res.data.avatarUrl;
      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
      setAvatarPreview(null); // Xóa preview sau khi upload thành công
      setAvatarFile(null);
      
      showSuccess('Cập nhật ảnh đại diện thành công!');
      
      await fetchUserData();
      
    } catch (error) {
      console.error('Avatar upload error:', error);
      showError('Lỗi khi cập nhật ảnh đại diện!');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      showError('Mật khẩu xác nhận không khớp!');
      return;
    }
    setLoading(true);
    try {
      // Đảm bảo date_of_birth đúng định dạng YYYY-MM-DD hoặc null
      let date_of_birth = formData.date_of_birth
        ? dayjs(formData.date_of_birth).format('YYYY-MM-DD')
        : null;
      await axios.put(`/api/users/${currentUser.id}`, {
        ...formData,
        date_of_birth,
        password: formData.password ? formData.password : undefined
      });
      showSuccess('Cập nhật thông tin thành công!');
      await fetchUserData();
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
    } catch (error) {
      console.error('Update error:', error);
      showError('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
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

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin':
        return <span className="badge bg-warning text-dark">Quản trị viên</span>;
      case 'staff':
        return <span className="badge bg-info">Nhân viên</span>;
      default:
        return <span className="badge bg-primary">Khách hàng</span>;
    }
  };

  return (
    <>
      <div className="container my-5">
        <div className="row justify-content-center g-4">
          <div className="col-lg-4">
            <div className="card p-4 text-center">
              <h4 className="fw-bold mb-1">{formData.name}</h4>
              <div className="mb-3">
                <div className="position-relative d-inline-block">
                  <img
                    src={avatarPreview || formData.avatar || 'https://via.placeholder.com/120x120?text=Avatar'}
                    alt="Avatar"
                    className="rounded-circle"
                    style={{ 
                      width: 120, 
                      height: 120, 
                      objectFit: 'cover', 
                      border: '3px solid #eee' 
                    }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x120?text=Avatar';
                    }}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="position-absolute bottom-0 end-0 btn btn-sm btn-light border rounded-circle"
                    style={{ cursor: 'pointer', width: '32px', height: '32px' }}
                    title="Đổi ảnh"
                  >
                    <i className="bi bi-camera"></i>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>
              
              <button
                className="btn btn-success w-100 mb-2"
                type="button"
                onClick={handleAvatarUpload}
                disabled={!avatarFile || uploadingAvatar}
              >
                {uploadingAvatar ? (
                  <>
                    <i className="spinner-border spinner-border-sm me-2"></i>
                    Đang tải lên...
                  </>
                ) : (
                  avatarFile ? 'Cập nhật ảnh đại diện' : 'Chọn ảnh để cập nhật'
                )}
              </button>
              
              <div className="mb-3 text-muted small">
                <strong>Thành viên từ:</strong><br />
                {currentUser?.created_at ? new Date(currentUser.created_at).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit', 
                  year: 'numeric'
                }) : 'Không rõ'}
              </div>
              
              <div className="mb-2">
                {getRoleBadge(currentUser?.role)}
              </div>
              
              <div className="mb-2">
                {getStatusBadge(formData.status)}
              </div>
              
              {formData.status === 'blocked' && (
                <div className="alert alert-warning mt-2 py-2">
                  <small>
                    <i className="bi bi-exclamation-triangle"></i>
                    Tài khoản đã bị khóa. Liên hệ admin để được hỗ trợ.
                  </small>
                </div>
              )}
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card p-4">
              <h3 className="fw-bold mb-4">Chỉnh sửa thông tin cá nhân</h3>
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label className="form-label">Họ tên</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Địa chỉ</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Ngày sinh</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="form-control"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Giới tính</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Chưa cập nhật</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-control"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-success px-4" disabled={loading}>
                  {loading ? 'Đang cập nhật...' : 'Lưu thông tin'}
                </button>
              </form>
              
              {/* <div className="mt-4 p-3 bg-light rounded">
                <h6 className="fw-bold mb-2">Thông tin tài khoản</h6>
                <div className="text-muted small">
                  <div className="row">
                    <div className="col-md-6 mb-1">
                      <strong>ID:</strong> #{currentUser?.id || 'N/A'}
                    </div>
                    <div className="col-md-6 mb-1">
                      <strong>Email xác thực:</strong> {currentUser?.email_verified_at
                        ? <span className="text-success">Đã xác thực</span>
                        : <span className="text-warning">Chưa xác thực</span>
                      }
                    </div>
                    <div className="col-md-6 mb-1">
                      <strong>Trạng thái:</strong> {getStatusBadge(formData.status)}
                    </div>
                    <div className="col-md-6 mb-1">
                      <strong>Vai trò:</strong> {getRoleBadge(currentUser?.role)}
                    </div>
                    <div className="col-md-6 mb-1">
                      <strong>Ngày tạo:</strong> {currentUser?.created_at 
                        ? new Date(currentUser.created_at).toLocaleString('vi-VN')
                        : 'Không rõ'
                      }
                    </div>
                    <div className="col-md-6 mb-1">
                      <strong>Cập nhật cuối:</strong> {currentUser?.updated_at 
                        ? new Date(currentUser.updated_at).toLocaleString('vi-VN')
                        : 'Không rõ'
                      }
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Nút trở lại đầu trang */}
      <button
        type="button"
        onClick={scrollToTop}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 999,
          background: '#00a65a',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 48,
          height: 48,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: 24,
          cursor: 'pointer'
        }}
        title="Lên đầu trang"
      >
        <i className="bi bi-arrow-up"></i>
      </button>

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

export default Profile;
