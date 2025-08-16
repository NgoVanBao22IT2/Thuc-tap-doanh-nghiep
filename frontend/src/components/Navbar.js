import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Kiểm tra xem có đang ở trang admin không
  const isAdminPage = location.pathname.startsWith("/admin");
  const isAdmin = currentUser?.role === "admin";

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light ">
      <div className="container">
        <Link
          className="navbar-brand text-success mt-1"
          to={isAdmin && isAdminPage ? "/admin" : "/"}
        >
          <img
            src="/images/logo.png"
            style={{ height: "50px", marginRight: "10px" }}
          />
          BAOBAO{" "}
          {isAdmin && isAdminPage && (
            <span className="badge bg-danger ms-2">Admin</span>
          )}
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {/* Menu cho Admin */}
          {isAdmin && isAdminPage ? (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/products">
                  Sản phẩm
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/orders">
                  Đơn hàng
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/categories">
                  Danh mục
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/admin/reviews">
                  Đánh giá
                </Link>
              </li>
            </ul>
          ) : (
            /* Menu cho User */
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  Trang chủ
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/products">
                  Sản phẩm
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/sale-off">
                  Sale Off
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/news">
                  Tin tức
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/contact">
                  Liên hệ
                </Link>
              </li>
            </ul>
          )}

          <ul className="navbar-nav">
            {/* Chỉ hiển thị giỏ hàng cho user */}
            {!isAdmin || !isAdminPage ? (
              <li className="nav-item">
                <Link className="nav-link position-relative" to="/cart">
                  Giỏ hàng
                  {getCartItemsCount() > 0 && (
                    <span className="cart-badge">{getCartItemsCount()}</span>
                  )}
                </Link>
              </li>
            ) : null}

            {currentUser ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle btn btn-link"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    style={{ border: "none", color: "inherit" }}
                  >
                    {currentUser.name}
                  </button>
                  <ul className="dropdown-menu">
                    {isAdmin && isAdminPage ? (
                      /* Menu Admin */
                      <>
                        <li>
                          <Link className="dropdown-item" to="/">
                            🏠 Về trang chủ
                          </Link>
                        </li>
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    ) : (
                      /* Menu User */
                      <>
                        <li>
                          <Link className="dropdown-item" to="/profile">
                            Hồ sơ
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item" to="/orders">
                            Đơn hàng
                          </Link>
                        </li>
                        {isAdmin && (
                          <li>
                            <Link className="dropdown-item" to="/admin">
                              Quản trị
                            </Link>
                          </li>
                        )}
                        <li>
                          <hr className="dropdown-divider" />
                        </li>
                      </>
                    )}
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Đăng nhập
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    Đăng ký
                  </Link>
                </li>
              </>
            )}
           
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
