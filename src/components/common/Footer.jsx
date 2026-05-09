import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../utils/constants";
import { FaFacebook, FaYoutube, FaTwitter, FaLinkedin } from "react-icons/fa";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">E</div>
              <span className="logo-text">EduLearn</span>
            </div>
            <p className="footer-desc">
              Nền tảng học tập trực tuyến hàng đầu Việt Nam. Khám phá hàng nghìn
              khóa học chất lượng cao từ các giảng viên hàng đầu.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Youtube">
                <FaYoutube size={20} />
              </a>
              <a href="#" className="social-link" aria-label="Twitter">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="social-link" aria-label="LinkedIn">
                <FaLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-col">
            <h4>Khóa học</h4>
            <ul>
              <li>
                <Link to={ROUTES.COURSES}>Tất cả khóa học</Link>
              </li>
              <li>
                <Link to={`${ROUTES.COURSES}?level=BEGINNER`}>
                  Người mới bắt đầu
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.COURSES}?level=INTERMEDIATE`}>
                  Trung cấp
                </Link>
              </li>
              <li>
                <Link to={`${ROUTES.COURSES}?level=ADVANCED`}>Nâng cao</Link>
              </li>
              <li>
                <Link to={ROUTES.SEARCH}>Tìm kiếm</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Tài khoản</h4>
            <ul>
              <li>
                <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER}>Đăng ký</Link>
              </li>
              <li>
                <Link to={ROUTES.STUDENT_DASHBOARD}>Dashboard học sinh</Link>
              </li>
              <li>
                <Link to={ROUTES.PROFILE}>Hồ sơ</Link>
              </li>
              <li>
                <Link to={ROUTES.WISHLIST}>Yêu thích</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <a href="#">Trung tâm trợ giúp</a>
              </li>
              <li>
                <a href="#">Liên hệ</a>
              </li>
              <li>
                <a href="#">Chính sách bảo mật</a>
              </li>
              <li>
                <a href="#">Điều khoản sử dụng</a>
              </li>
              <li>
                <a href="#">Trở thành giảng viên</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} EduLearn. Bảo lưu mọi quyền.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
