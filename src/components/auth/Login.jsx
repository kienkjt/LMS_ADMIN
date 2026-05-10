import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import { authService } from "../../services/authService";
import { ROUTES, ROLES } from "../../utils/constants";
import {
  extractValidationErrors,
  handleApiError,
} from "../../utils/errorHandler";
import { toast } from "react-toastify";
import "./Auth.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || null;

  // Show success messages from previous pages
  React.useEffect(() => {
    if (location.state?.resetSuccess) {
      setSuccess(
        "Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.",
      );
      setTimeout(() => setSuccess(""), 5000);
    }
    if (location.state?.registrationSuccess) {
      setSuccess("✅ Xác thực tài khoản thành công! Vui lòng đăng nhập.");
      setTimeout(() => setSuccess(""), 5000);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setErrors({
        ...(form.email ? {} : { email: "Vui lòng nhập email" }),
        ...(form.password ? {} : { password: "Vui lòng nhập mật khẩu" }),
      });
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      console.debug("[Login] Attempting login for:", form.email);
      const res = await authService.login(form);
      console.debug("[Login] Login response received");

      // Extract user info from response (backend returns in data.data)
      const loginData = res.data?.data || res.data;

      // Simple user object with essentials
      const user = {
        email: loginData.email || form.email,
        role: loginData.role,
        message: loginData.message,
      };

      console.debug("[Login] User object:", user);

      if (user.role !== ROLES.ADMIN) {
        await authService.logout();
        toast.error("Truy cập bị từ chối: Chỉ tài khoản Quản trị viên mới được phép đăng nhập vào hệ thống này.");
        setLoading(false);
        return;
      }

      // Save to Redux (localStorage is handled by authService)
      dispatch(loginSuccess(user));
      console.debug("[Login] Dispatched loginSuccess, navigating...");

      // Always go to Admin dashboard after login
      navigate(from || ROUTES.ADMIN_DASHBOARD, { replace: true });
    } catch (err) {
      console.error("[Login] Login error:", err);
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
      {/* Left Panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <Link to={ROUTES.HOME} className="auth-logo">
            <div className="logo-icon-lg">E</div>
            <span className="logo-text-lg">LMS</span>
          </Link>
          <h1>Học tập không giới hạn</h1>
          <p>
            Khám phá hàng nghìn khóa học từ các chuyên gia hàng đầu. Nâng cao kỹ
            năng và mở ra cơ hội mới ngay hôm nay.
          </p>
          <div className="auth-stats">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Khóa học</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Học viên</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">500+</div>
              <div className="stat-label">Giảng viên</div>
            </div>
          </div>
          <div className="auth-testimonials">
            <div className="testimonial">
              <p>
                "LMS đã giúp tôi chuyển đổi sự nghiệp. Các khóa học chất lượng và giảng viên tận tâm đã giúp tôi học được những kỹ năng mới và tìm được công việc mơ ước.  "
              </p>
              <div className="testimonial-author">
                <div className="avatar avatar-sm">TK</div>
                <span>Nguyễn Trung Kiên — Software Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>Chào mừng trở lại</h2>
            <p>Đăng nhập để tiếp tục hành trình học tập</p>
          </div>

          {success && (
            <div
              style={{
                background: "var(--success-alpha)",
                color: "var(--success-dark)",
                border: "1px solid var(--success)",
                borderRadius: "var(--radius-lg)",
                padding: "12px 16px",
                marginBottom: "16px",
                fontSize: "14px",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Email <span>*</span>
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                className={`form-input ${errors.email ? "input-error" : ""}`}
                placeholder="email@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
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
                  id="login-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className={`form-input has-icon-right ${errors.password ? "input-error" : ""}`}
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

            <div className="auth-row">
              <label className="checkbox-label">
                <input type="checkbox" id="remember-me" />
                Ghi nhớ đăng nhập
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
          <p className="auth-footer-text">
            Chưa có tài khoản?{" "}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;




