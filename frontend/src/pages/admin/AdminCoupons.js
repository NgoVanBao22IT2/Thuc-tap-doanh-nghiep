import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from 'axios';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minimum_amount: '',
    maximum_discount: '',
    usage_limit: '',
    user_limit: 1,
    valid_from: '',
    valid_to: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await axios.get('/api/coupons/admin');
      setCoupons(response.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.code || !formData.name || !formData.value || !formData.valid_from || !formData.valid_to) {
      alert('Vui lòng nhập đầy đủ các trường bắt buộc!');
      return;
    }

    // Validate datetime
    const validFrom = new Date(formData.valid_from);
    const validTo = new Date(formData.valid_to);
    if (validFrom >= validTo) {
      alert('Ngày bắt đầu phải nhỏ hơn ngày kết thúc!');
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        code: formData.code.toUpperCase(),
        value: parseFloat(formData.value),
        minimum_amount: formData.minimum_amount ? parseFloat(formData.minimum_amount) : 0,
        maximum_discount: formData.maximum_discount ? parseFloat(formData.maximum_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        user_limit: formData.user_limit ? parseInt(formData.user_limit) : 1,
        status: formData.status || 'active'
      };

      if (editingCoupon) {
        await axios.put(`/api/coupons/${editingCoupon.id}`, dataToSubmit);
        alert('Cập nhật mã giảm giá thành công!');
      } else {
        await axios.post('/api/coupons', dataToSubmit);
        alert('Thêm mã giảm giá thành công!');
      }
      
      setShowModal(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      type: coupon.type,
      value: coupon.value,
      minimum_amount: coupon.minimum_amount,
      maximum_discount: coupon.maximum_discount || '',
      usage_limit: coupon.usage_limit || '',
      user_limit: coupon.user_limit,
      valid_from: new Date(coupon.valid_from).toISOString().slice(0, 16),
      valid_to: new Date(coupon.valid_to).toISOString().slice(0, 16),
      status: coupon.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'percentage',
      value: '',
      minimum_amount: '',
      maximum_discount: '',
      usage_limit: '',
      user_limit: 1,
      valid_from: '',
      valid_to: '',
      status: 'active'
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa mã giảm giá này?')) {
      try {
        await axios.delete(`/api/coupons/${id}`);
        alert('Xóa mã giảm giá thành công!');
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra!');
      }
    }
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎫 Quản lý mã giảm giá</h2>
        <button 
          className="btn btn-admin-primary"
          onClick={() => setShowModal(true)}
        >
          ➕ Thêm mã giảm giá
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
                <th>Mã</th>
                <th>Tên</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đã dùng</th>
                <th>Hạn sử dụng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map(coupon => (
                <tr key={coupon.id}>
                  <td>
                    <code className="bg-primary text-white px-2 py-1 rounded">
                      {coupon.code}
                    </code>
                  </td>
                  <td>{coupon.name}</td>
                  <td>
                    <span className={`badge ${coupon.type === 'percentage' ? 'bg-success' : 'bg-info'}`}>
                      {coupon.type === 'percentage' ? 'Phần trăm' : 'Cố định'}
                    </span>
                  </td>
                  <td>
                    {coupon.type === 'percentage' 
                      ? `${coupon.value}%` 
                      : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.value)
                    }
                  </td>
                  <td>{coupon.used_count}/{coupon.usage_limit || '∞'}</td>
                  <td>
                    <small>
                      {new Date(coupon.valid_from).toLocaleDateString('vi-VN')} - {' '}
                      {new Date(coupon.valid_to).toLocaleDateString('vi-VN')}
                    </small>
                  </td>
                  <td>
                    <span className={`badge ${coupon.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                      {coupon.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(coupon)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(coupon.id)}
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
                  {editingCoupon ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}
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
                      <label className="form-label">Mã giảm giá:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                        placeholder="VD: WELCOME10"
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Tên mã:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Mô tả:</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Loại giảm giá:</label>
                      <select
                        className="form-select"
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Cố định (VND)</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giá trị:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
                        placeholder={formData.type === 'percentage' ? '10' : '50000'}
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Đơn hàng tối thiểu:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.minimum_amount}
                        onChange={(e) => setFormData({...formData, minimum_amount: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Giảm tối đa (nếu %):</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.maximum_discount}
                        onChange={(e) => setFormData({...formData, maximum_discount: e.target.value})}
                        placeholder="Để trống nếu không giới hạn"
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Từ ngày:</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Đến ngày:</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formData.valid_to}
                        onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                        required
                      />
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
                    {editingCoupon ? 'Cập nhật' : 'Thêm'}
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

export default AdminCoupons;
