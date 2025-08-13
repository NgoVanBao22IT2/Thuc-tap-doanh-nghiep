import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products', icon: '📦', label: 'Quản lý sản phẩm' },
    { path: '/admin/categories', icon: '📂', label: 'Quản lý danh mục' },
    { path: '/admin/brands', icon: '🏷️', label: 'Quản lý thương hiệu' },
    { path: '/admin/orders', icon: '🛒', label: 'Quản lý đơn hàng' },
    { path: '/admin/users', icon: '👥', label: 'Quản lý người dùng' },
    { path: '/admin/reviews', icon: '⭐', label: 'Quản lý đánh giá' },
    { path: '/admin/news', icon: '📰', label: 'Quản lý tin tức' }, 
    { path: '/admin/coupons', icon: '🎫', label: 'Mã giảm giá' },
    { path: '/admin/slides', icon: '🖼️', label: 'Slide Banner' },
    { path: '/admin/contacts', icon: '📞', label: 'Liên hệ' },
    { path: '/admin/settings', icon: '⚙️', label: 'Cài đặt' },
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="d-flex align-items-center">
            <img src="/images/logo.png" style={{ height: "40px" }} />
            <h3 className="ms-2 mb-0">Badminton Admin</h3>
          </div>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <i>{item.icon}</i>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Bar */}
        <div className="admin-topbar">
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex align-items-center">
              <button
                className="btn btn-link d-md-none"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                ☰
              </button>
              <h4 className="mb-0 ms-2">
                {menuItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h4>
            </div>
            
            <div className="d-flex align-items-center">
              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  👤 {currentUser?.name}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <Link className="dropdown-item" to="/">
                      🏠 Về trang chủ
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      🚪 Đăng xuất
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
