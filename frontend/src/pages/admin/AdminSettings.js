import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import { useModal } from '../../hooks/useModal';
import axios from 'axios';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { modal, hideModal, showSuccess, showError } = useModal();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/settings');
      const settingsObj = {};
      response.data.forEach(setting => {
        settingsObj[setting.key_name] = setting.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await axios.put('/api/settings', settings);
      showSuccess('Cập nhật cài đặt thành công!');
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <h2 className="mb-4">⚙️ Cài đặt hệ thống</h2>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-8">
              <div className="admin-card">
                <div className="card-header">
                  <h5 className="mb-0">Thông tin cơ bản</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tên website:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.site_name || ''}
                        onChange={(e) => handleChange('site_name', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Đơn vị tiền tệ:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.currency || 'VND'}
                        onChange={(e) => handleChange('currency', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Mô tả website:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settings.site_description || ''}
                      onChange={(e) => handleChange('site_description', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Miễn phí ship từ (VND):</label>
                    <input
                      type="number"
                      className="form-control"
                      value={settings.free_shipping_threshold || ''}
                      onChange={(e) => handleChange('free_shipping_threshold', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h5 className="mb-0">Thông tin liên hệ</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Số điện thoại:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.contact_phone || ''}
                        onChange={(e) => handleChange('contact_phone', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email liên hệ:</label>
                      <input
                        type="email"
                        className="form-control"
                        value={settings.contact_email || ''}
                        onChange={(e) => handleChange('contact_email', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Địa chỉ:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settings.contact_address || ''}
                      onChange={(e) => handleChange('contact_address', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h5 className="mb-0">Cài đặt SEO</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <label className="form-label">Meta Title:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.meta_title || ''}
                      onChange={(e) => handleChange('meta_title', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Meta Description:</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={settings.meta_description || ''}
                      onChange={(e) => handleChange('meta_description', e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Keywords:</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.meta_keywords || ''}
                      onChange={(e) => handleChange('meta_keywords', e.target.value)}
                      placeholder="Cách nhau bằng dấu phẩy"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="admin-card">
                <div className="card-header">
                  <h5 className="mb-0">Cài đặt nhanh</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.maintenance_mode === '1'}
                        onChange={(e) => handleChange('maintenance_mode', e.target.checked ? '1' : '0')}
                      />
                      <label className="form-check-label">
                        Chế độ bảo trì
                      </label>
                    </div>
                    <small className="text-muted">Website sẽ hiển thị trang bảo trì</small>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.allow_registration === '1'}
                        onChange={(e) => handleChange('allow_registration', e.target.checked ? '1' : '0')}
                      />
                      <label className="form-check-label">
                        Cho phép đăng ký
                      </label>
                    </div>
                    <small className="text-muted">Khách hàng có thể tạo tài khoản mới</small>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={settings.auto_approve_reviews === '1'}
                        onChange={(e) => handleChange('auto_approve_reviews', e.target.checked ? '1' : '0')}
                      />
                      <label className="form-check-label">
                        Tự động duyệt đánh giá
                      </label>
                    </div>
                    <small className="text-muted">Đánh giá sẽ hiển thị ngay không cần duyệt</small>
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <div className="card-header">
                  <h5 className="mb-0">Thống kê</h5>
                </div>
                <div className="card-body">
                  <div className="mb-2">
                    <small className="text-muted">Phiên bản hệ thống:</small>
                    <div>v1.0.0</div>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">Cập nhật cuối:</small>
                    <div>{new Date().toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mt-4">
            <button 
              type="button" 
              className="btn btn-secondary me-2"
              onClick={() => window.location.reload()}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </form>
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

export default AdminSettings;
