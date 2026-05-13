import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { ROUTES } from "../../utils/constants";
import {
  extractValidationErrors,
  handleApiError,
} from "../../utils/errorHandler";
import { toast } from "react-toastify";
import "./Auth.css";

const Register = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      setErrors({ fullName: "Vui lòng nhập họ tên" });
      return;
    }
    if (!form.email) {
      setErrors({ email: "Vui lòng nhập email" });
      return;
    }
    if (form.password.length < 8) {
      setErrors({ password: "Mật khẩu phải có ít nhất 8 ký tự" });
      return;
    }
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setErrors({
        password:
          "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)",
      });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await authService.register({
        fullName: form.fullName.trim(),
        email: form.email,
        password: form.password,
        role: form.role,
      });
      // Redirect to OTP verification
      navigate(ROUTES.VERIFY_OTP, {
        state: { email: form.email, isRegistration: true },
      });
    } catch (err) {
      const validationErrors = extractValidationErrors(err);
      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        toast.error(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header" style={{ textAlign: "center" }}>
            <Link
              to={ROUTES.HOME}
              className="auth-logo"
              style={{ justifyContent: "center", marginBottom: "20px" }}
            >
              <div className="logo-icon-lg">L</div>
              <span className="logo-text-lg" style={{ color: "#0f172a" }}>
                LMS
              </span>
            </Link>
            <h2>Tạo tài khoản</h2>
            <p>Miễn phí, không cần thẻ tín dụng</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Họ và tên <span>*</span>
              </label>
              <input
                id="reg-fullname"
                name="fullName"
                type="text"
                className={`form-input ${errors.fullName ? "input-error" : ""}`}
                placeholder="Nguyễn Văn A"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                required
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span>*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Mật khẩu <span>*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className={`form-input has-icon-right ${errors.password ? "input-error" : ""}`}
                  placeholder="Ít nhất 8 ký tự (hoa, thường, số, ký tự đặc biệt)"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Vai trò <span>*</span>
              </label>
              <select
                id="reg-role"
                name="role"
                className="form-input"
                value={form.role}
                onChange={handleChange}
                required
              >
                <option value="STUDENT">Học viên</option>
                <option value="INSTRUCTOR">Giảng viên</option>
              </select>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span> Đang đăng ký...
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: "24px" }}>
            Đã có tài khoản?{" "}
            <Link to={ROUTES.LOGIN} className="auth-link">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
