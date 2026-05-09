import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import { ROUTES } from "../../utils/constants";
import { FiMail, FiLock } from "react-icons/fi";
import "./Auth.css";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const isRegistration = location.state?.isRegistration || false;
  const isReset = location.state?.isReset || false;

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
    }
  };

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Vui lòng nhập đủ 6 chữ số");
      return;
    }
    setLoading(true);
    try {
      if (isRegistration) {
        // For registration OTP verification
        await authService.verifyOtp({ email, otp: code });
        setSuccess("Xác thực thành công! Đang chuyển hướng...");
        setTimeout(
          () =>
            navigate(ROUTES.LOGIN, { state: { registrationSuccess: true } }),
          1500,
        );
      } else if (isReset) {
        // For password reset OTP verification
        await authService.verifyResetOtp({ email, otp: code });
        setSuccess("OTP hợp lệ! Đang chuyển hướng...");
        setTimeout(
          () =>
            navigate(ROUTES.RESET_PASSWORD, {
              state: { email, verified: true },
            }),
          1500,
        );
      } else {
        // Fallback for registration
        await authService.verifyOtp({ email, otp: code });
        setSuccess("Xác thực thành công! Đang chuyển hướng...");
        setTimeout(
          () =>
            navigate(ROUTES.LOGIN, { state: { registrationSuccess: true } }),
          1500,
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      if (isRegistration) {
        // For registration, resend OTP
        await authService.register({ email });
      } else if (isReset) {
        // For password reset, resend OTP
        await authService.forgotPassword({ email });
      }
      setCountdown(300); // Reset to 5 minutes
      setSuccess("Đã gửi lại mã OTP!");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Không thể gửi lại mã. Vui lòng thử lại.");
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
            <FiMail size={80} />
          </div>
          <h1>Xác thực tài khoản</h1>
          <p>
            Chúng tôi đã gửi mã xác thực 6 chữ số đến email của bạn. Vui lòng
            kiểm tra hộp thư đến.
          </p>
        </div>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              <FiLock size={48} />
            </div>
            <h2>Nhập mã OTP</h2>
            {email && (
              <p>
                Mã được gửi đến{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {email}
                </strong>
              </p>
            )}
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}
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
              ✅ {success}
            </div>
          )}

          <div className="otp-inputs" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                id={`otp-input-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
              />
            ))}
          </div>

          <button
            id="verify-otp-submit"
            className="btn btn-primary btn-full btn-lg"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span> Đang xác thực...
              </>
            ) : (
              "Xác thực"
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
              Không nhận được mã?{" "}
              <button
                style={{
                  border: "none",
                  background: "none",
                  color:
                    countdown > 0 ? "var(--text-tertiary)" : "var(--primary)",
                  fontWeight: "600",
                  cursor: countdown > 0 ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
                onClick={handleResend}
                disabled={countdown > 0}
              >
                {countdown > 0
                  ? `Gửi lại sau ${formatCountdown(countdown)}`
                  : "Gửi lại"}
              </button>
            </p>
          </div>

          <p className="auth-footer-text" style={{ marginTop: "20px" }}>
            <Link
              to={isReset ? ROUTES.FORGOT_PASSWORD : ROUTES.REGISTER}
              className="auth-link"
            >
              ← Quay lại {isReset ? "quên mật khẩu" : "đăng ký"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
