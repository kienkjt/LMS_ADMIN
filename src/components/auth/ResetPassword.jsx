import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/authService";
import { ROUTES } from "../../utils/constants";
import { FiKey } from "react-icons/fi";
import "./Auth.css";

const ResetPassword = () => {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const verified = location.state?.verified || false;

  // Redirect if not verified
  React.useEffect(() => {
    if (!verified || !email) {
      navigate(ROUTES.FORGOT_PASSWORD);
    }
  }, [verified, email, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (form.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(form.password)) {
      setError(
        "Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)",
      );
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email,
        newPassword: form.password,
      });
      // Success - redirect to login
      navigate(ROUTES.LOGIN, { state: { resetSuccess: true } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Đặt lại mật khẩu thất bại. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <div className="logo-icon-lg">E</div>
            <span className="logo-text-lg">EduLearn</span>
          </div>
          <div
            style={{ fontSize: "80px", textAlign: "center", margin: "32px 0" }}
          >
            <FiKey size={80} />
          </div>
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới để hoàn tất quá trình khôi phục tài khoản.</p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>Mật khẩu mới</h2>
            <p>Tạo một mật khẩu mạnh để bảo vệ tài khoản của bạn</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Mật khẩu mới <span>*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="reset-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className="form-input has-icon-right"
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
            </div>

            <div className="form-group">
              <label className="form-label">
                Xác nhận mật khẩu <span>*</span>
              </label>
              <div className="input-wrapper">
                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  className="form-input has-icon-right"
                  placeholder="Nhập lại mật khẩu mới"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  tabIndex={-1}
                >
                  {showConfirmPass ? (
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
            </div>

            <button
              id="reset-password-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span> Đang đặt lại...
                </>
              ) : (
                "Đặt lại mật khẩu"
              )}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: "24px" }}>
            <Link to={ROUTES.LOGIN} className="auth-link">
              ← Quay lại đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
