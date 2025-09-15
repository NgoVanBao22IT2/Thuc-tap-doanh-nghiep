import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import ScrollToTopButton from "../components/ScrollToTopButton";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { modal, hideModal, showSuccess, showError } = useModal();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      showError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      showSuccess("Đăng nhập thành công!", "Thành công", () => {
        navigate(from, { replace: true });
      });
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      showError("Vui lòng nhập email!");
      return;
    }

    setForgotLoading(true);
    try {
      // Gọi API forgot password (cần implement backend)
      // await forgotPassword(forgotEmail);
      showSuccess(
        "Đã gửi link đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra hộp thư!",
        "Thành công",
        () => {
          setShowForgotPassword(false);
          setForgotEmail("");
        }
      );
    } catch (error) {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra khi gửi email";
      showError(message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-success">Đăng nhập</h2>
                  <p className="text-muted">Chào mừng bạn quay trở lại!</p>
                </div>

                {!showForgotPassword ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Nhập email của bạn"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        <i className="bi bi-lock me-2"></i>
                        Mật khẩu
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control form-control-lg"
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Nhập mật khẩu"
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i
                            className={`bi ${
                              showPassword ? "bi-eye-slash" : "bi-eye"
                            }`}
                          ></i>
                        </button>
                      </div>
                    </div>

                    <div className="mb-3 text-end">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-none"
                        onClick={() => setShowForgotPassword(true)}
                      >
                        <small>Quên mật khẩu?</small>
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 mb-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Đang đăng nhập...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-in-right me-2"></i>
                          Đăng nhập
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <p className="mb-0">
                        Chưa có tài khoản?{" "}
                        <Link
                          to="/register"
                          className="text-success text-decoration-none fw-medium"
                        >
                          Đăng ký ngay
                        </Link>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleForgotPassword}>
                    <div className="text-center mb-4">
                      <i className="bi bi-key display-4 text-success"></i>
                      <h4 className="mt-2">Quên mật khẩu?</h4>
                      <p className="text-muted">
                        Nhập email để nhận link đặt lại mật khẩu
                      </p>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="forgotEmail" className="form-label">
                        <i className="bi bi-envelope me-2"></i>
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="forgotEmail"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Nhập email của bạn"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-success btn-lg w-100 mb-3"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send me-2"></i>
                          Gửi link đặt lại
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        className="btn btn-link text-decoration-none"
                        onClick={() => setShowForgotPassword(false)}
                      >
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại đăng nhập
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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
      {/* Nút trở lại đầu trang */}
      <ScrollToTopButton bottom={88} right={32} zIndex={999} />
    </>
  );
};

export default Login;
