import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { ROUTES } from "../../utils/constants";
import { FiKey, FiLock } from "react-icons/fi";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      // Redirect to OTP verification page for password reset
      navigate(ROUTES.VERIFY_OTP, { state: { email, isReset: true } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Email không tồn tại trong hệ thống",
      );
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
              <div className="logo-icon-lg">E</div>
              <span className="logo-text-lg" style={{ color: "#0f172a" }}>
                LMS
              </span>
            </Link>
            <div
              style={{
                fontSize: "48px",
                marginBottom: "16px",
                color: "var(--primary)",
              }}
            >
              <FiLock size={48} />
            </div>
            <h2>Quên mật khẩu?</h2>
            <p>
              Nhập email của bạn, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
            </p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Email <span>*</span>
              </label>
              <div className="input-wrapper">
                {/* <span className="input-icon">✉️</span> */}
                <input
                  id="forgot-email"
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
              </div>
            </div>

            <button
              id="forgot-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span> Đang gửi...
                </>
              ) : (
                "Gửi mã OTP"
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

export default ForgotPassword;
