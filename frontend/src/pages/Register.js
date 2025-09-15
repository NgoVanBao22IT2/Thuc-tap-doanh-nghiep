import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Modal from "../components/Modal";
import { useModal } from "../hooks/useModal";
import ScrollToTopButton from "../components/ScrollToTopButton";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: [],
  });

  const { register } = useAuth();
  const navigate = useNavigate();
  const { modal, hideModal, showSuccess, showError } = useModal();

  const checkPasswordStrength = (password) => {
    let score = 0;
    const feedback = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Ít nhất 8 ký tự");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Có chữ thường");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Có chữ hoa");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Có số");
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Có ký tự đặc biệt");
    }

    return { score, feedback };
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Check password strength when password changes
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const getPasswordStrengthColor = (score) => {
    if (score <= 2) return "danger";
    if (score <= 3) return "warning";
    if (score <= 4) return "info";
    return "success";
  };

  const getPasswordStrengthText = (score) => {
    if (score <= 2) return "Yếu";
    if (score <= 3) return "Trung bình";
    if (score <= 4) return "Khá";
    return "Mạnh";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      showError("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (passwordStrength.score < 3) {
      showError("Mật khẩu quá yếu! Vui lòng tạo mật khẩu mạnh hơn.");
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showSuccess(
        "Đăng ký thành công! Chào mừng bạn đến với cửa hàng của chúng tôi.",
        "Thành công",
        () => navigate("/")
      );
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      showError(message);
    } finally {
      setLoading(false);
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
                  <h2 className="fw-bold text-success">Đăng ký</h2>
                  <p className="text-muted">
                    Tạo tài khoản mới để bắt đầu mua sắm
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person me-2"></i>
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

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

                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="d-flex align-items-center mb-1">
                          <small className="me-2">Độ mạnh:</small>
                          <span
                            className={`badge bg-${getPasswordStrengthColor(
                              passwordStrength.score
                            )}`}
                          >
                            {getPasswordStrengthText(passwordStrength.score)}
                          </span>
                        </div>
                        <div className="progress" style={{ height: "4px" }}>
                          <div
                            className={`progress-bar bg-${getPasswordStrengthColor(
                              passwordStrength.score
                            )}`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          ></div>
                        </div>
                        {passwordStrength.feedback.length > 0 && (
                          <small className="text-muted d-block mt-1">
                            Cần: {passwordStrength.feedback.join(", ")}
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">
                      <i className="bi bi-shield-lock me-2"></i>
                      Xác nhận mật khẩu
                    </label>
                    <div className="input-group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control form-control-lg"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        <i
                          className={`bi ${
                            showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                          }`}
                        ></i>
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="mt-1">
                        {formData.password === formData.confirmPassword ? (
                          <small className="text-success">
                            <i className="bi bi-check-circle me-1"></i>
                            Mật khẩu khớp
                          </small>
                        ) : (
                          <small className="text-danger">
                            <i className="bi bi-x-circle me-1"></i>
                            Mật khẩu không khớp
                          </small>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Đang đăng ký...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-person-plus me-2"></i>
                        Đăng ký
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="mb-0">
                      Đã có tài khoản?{" "}
                      <Link
                        to="/login"
                        className="text-success text-decoration-none fw-medium"
                      >
                        Đăng nhập ngay
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Nút trở lại đầu trang */}
      <ScrollToTopButton bottom={88} right={32} zIndex={999} />

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

export default Register;
