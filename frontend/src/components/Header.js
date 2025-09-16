import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import axios from "axios";

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { cartItems, clearCart: clearCartContext } = useCart();
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Cập nhật số lượng sản phẩm trong giỏ hàng từ context
    setCartItemsCount(cartItems.length);
  }, [cartItems]);

  const handleLogout = () => {
    // Không cần clear cart khi logout vì mỗi user có giỏ hàng riêng
    // Cart sẽ tự động được lưu theo user ID

    logout();
    navigate("/");
  };

  return (
    <header className="bg-light shadow-sm">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center py-3">
          <Link to="/" className="text-decoration-none">
            <h2 className="m-0 text-success">
              <i className="bi bi-bag-fill me-2"></i>
              DATT Shop
            </h2>
          </Link>

          <div className="position-relative">
            <Link
              to="/cart"
              className="btn btn-success position-relative"
              title="Giỏ hàng"
            >
              <i className="bi bi-cart-fill fs-4"></i>
              {cartItemsCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
