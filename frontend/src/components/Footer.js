import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <h5 className="fw-bold mb-2 text-success">
            <img src="/images/logo.png" style={{ height: "40px", marginRight: "5px" }} />
              BAOBAO Badminton
            </h5>
            <p className="mb-3">
              Cửa hàng thiết bị cầu lông hàng đầu Việt Nam với hơn 10 năm kinh nghiệm 
              phục vụ cộng đồng yêu thích môn thể thao vợt.
            </p>
            <div className="d-flex gap-3">
              <a href="#" className="text-decoration-none">
                <i className="bi bi-facebook fs-5"></i>
              </a>
              <a href="#" className="text-decoration-none">
                <i className="bi bi-instagram fs-5"></i>
              </a>
              <a href="#" className="text-decoration-none">
                <i className="bi bi-youtube fs-5"></i>
              </a>
              <a href="#" className="text-decoration-none">
                <i className="bi bi-tiktok fs-5"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-bold">Sản phẩm</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/products?category=1" className="text-decoration-none">Túi cầu lông</Link></li>
              <li className="mb-2"><Link to="/products?category=2" className="text-decoration-none">Vợt cầu lông</Link></li>
              <li className="mb-2"><Link to="/products?category=3" className="text-decoration-none">Giày cầu lông</Link></li>
              <li className="mb-2"><Link to="/products?category=4" className="text-decoration-none">Áo quần</Link></li>
              <li className="mb-2"><Link to="/products?category=5" className="text-decoration-none">Phụ kiện</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold">Hỗ trợ khách hàng</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/contact" className="text-decoration-none">Liên hệ</Link></li>
              <li className="mb-2"><Link to="/shipping-policy" className="text-decoration-none">Chính sách giao hàng</Link></li>
              <li className="mb-2"><Link to="/return-policy" className="text-decoration-none">Chính sách đổi trả</Link></li>
              <li className="mb-2"><Link to="/warranty" className="text-decoration-none">Bảo hành</Link></li>
              <li className="mb-2"><Link to="/faq" className="text-decoration-none">FAQ</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="fw-bold">
              Thông tin liên hệ
            </h6>
            <div className="mb-2">
              <i className="bi bi-telephone me-2"></i>
              <strong>Hotline:</strong> 0347-176-526
            </div>
            <div className="mb-2">
              <i className="bi bi-envelope me-2"></i>
              <strong>Email:</strong> baongo2722004@gmail.com
            </div>
            <div className="mb-2">
              <i className="bi bi-clock me-2"></i>
              <strong>Giờ làm việc:</strong> 8:00 - 22:00 (T2-CN)
            </div>
            <div>
              <i className="bi bi-map me-2"></i>
              37 Phước Tường 16, Phường An khê, Thành Phố Đà Nẵng
            </div>
          </div>
        </div>
        
        <hr className="my-4" style={{borderColor: '#34495e'}} />
        
        <div className="row align-items-center">
          <div className="col-md-12">
            <p className="mb-0 text-center text-md-center text-success fw-bold">
              &copy; 2025 BAOBAO Badminton. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
