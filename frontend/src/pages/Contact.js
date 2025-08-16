import React, { useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ScrollToTopButton from "../components/ScrollToTopButton";


const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 // Thêm hàm cuộn lên đầu trang
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/contacts', form);
      setSuccess('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gửi liên hệ thất bại!');
    }
    setLoading(false);
  };

  return (
    <div className="container my-5">
       {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <button 
                className="btn btn-link p-0"
                onClick={() => navigate('/')}
                style={{ color: '#00a61eff', textDecoration: 'none', fontWeight: 500 }}

              >
                Trang chủ
              </button>
            </li>
            <li className="breadcrumb-item">
              <button 
                className="btn btn-link p-0"
                onClick={() => navigate('/contact')}
                style={{ color: '#00a61eff', textDecoration: 'none', fontWeight: 500 }}

              >
                Liên hệ
              </button>
            </li>
            {/* <li className="breadcrumb-item active">
              <button 
                className="btn btn-link p-0"
                onClick={() => navigate('/products')}
                style={{ color: '#00a61eff', textDecoration: 'underline', fontWeight: 500 }}

              >
                {product.name}
              </button>
              </li> */}
          </ol>
        </nav>

   {/* Nút trở lại đầu trang */}
        <ScrollToTopButton bottom={88} right={32} zIndex={999} />



      <h2 className="fw-bold text-dark mb-4">Liên hệ với chúng tôi</h2>
      <div className="row">
        <div className="col-lg-6 mb-4">
          <form onSubmit={handleSubmit} className="card p-4 shadow-sm">
            {/* Hiển thị thông báo thành công/thất bại */}
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {/* Form nhập thông tin liên hệ */}
            <div className="mb-3">
              <label className="form-label">Họ tên</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                className="form-control"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Chủ đề</label>
              <input
                type="text"
                className="form-control"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Nội dung</label>
              <textarea
                className="form-control"
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi liên hệ'}
            </button>
          </form>
        </div>
        <div className="col-lg-6 mb-4">
          <div className="card p-4 h-100 shadow-sm">
            <h5 className="fw-bold mb-3">Thông tin liên hệ</h5>
            <div className="mb-2">
              <i className="bi bi-geo-alt-fill text-success me-2"></i>
              <span>Địa chỉ: 37 Phước Tường 16, Phường An khê, Thành Phố Đà Nẵng</span>
            </div>
            <div className="mb-2">
              <i className="bi bi-envelope-fill text-success me-2"></i>
              <span>Email: baongo2722004@gmail.com</span>
            </div>
            <div className="mb-2">
              <i className="bi bi-telephone-fill text-success me-2"></i>
              <span>Hotline: 0347176526</span>
            </div>
            <div className="mb-2">
              <i className="bi bi-clock-fill text-success me-2"></i>
              <span>Giờ làm việc: 8h - 22h (T2 - CN)</span>
            </div>
            <div className="mt-3">
              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.123456789!2d106.123456789!3d10.123456789!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMTDCsDA3JzI0LjAiTiAxMDbCsDA3JzI0LjAiRQ!5e0!3m2!1svi!2s!4v0000000000000"
                width="100%"
                height="220"
                style={{ border: 0, borderRadius: 8 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
};

export default Contact;
