import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { clearCart } from "../../store/cartSlice";
import { authService } from "../../services/authService";
import { ROUTES, ROLES } from "../../utils/constants";
import { getInitials, getDisplayName } from "../../utils/helpers";
import NotificationCenter from "./NotificationCenter";
import {
  FiShoppingCart,
  FiBarChart2,
  FiFileText,
  FiUser,
  FiBook,
  FiHeart,
  FiLogOut,
  FiChevronDown,
  FiSearch,
} from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const mobileOpenRef = useRef();

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      // Defer state update to avoid cascading renders
      Promise.resolve().then(() => setMobileOpen(false));
    }
  }, [location, mobileOpen]);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    dispatch(clearCart());
    navigate(ROUTES.HOME);
    setDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const getDashboardRoute = () => {
    if (!user) return ROUTES.HOME;
    switch (user.role) {
      case ROLES.ADMIN:
        return ROUTES.ADMIN_DASHBOARD;
      case ROLES.INSTRUCTOR:
        return ROUTES.INSTRUCTOR_DASHBOARD;
      default:
        return ROUTES.STUDENT_DASHBOARD;
    }
  };

  return (
    <nav className={`navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="navbar-logo">
          <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7V12C2 18.6 7.1 24 12 24C16.9 24 22 18.6 22 12V7L12 2Z" />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              E
            </text>
          </svg>
          <span className="logo-text">EduLearn</span>
        </Link>

        {/* Search Bar - Hidden on mobile, shown on desktop */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </form>

        {/* Nav Links */}
        <div className="navbar-links">
          <Link
            to={ROUTES.COURSES}
            className={`nav-link ${location.pathname === ROUTES.COURSES ? "active" : ""}`}
          >
            Khóa học
          </Link>
          {isAuthenticated && user?.role === ROLES.STUDENT && (
            <Link to={ROUTES.STUDENT_ORDERS} className="nav-link">
              Đơn hàng
            </Link>
          )}
          {isAuthenticated && user?.role === ROLES.INSTRUCTOR && (
            <Link
              to={ROUTES.INSTRUCTOR_DASHBOARD}
              className={`nav-link ${location.pathname.startsWith("/instructor") ? "active" : ""}`}
            >
              Giảng dạy
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {/* Cart */}
              {user?.role === ROLES.STUDENT && (
                <Link to={ROUTES.CART} className="nav-icon-btn" id="cart-icon">
                  <FiShoppingCart size={20} />
                  {items.length > 0 && (
                    <span className="nav-badge">{items.length}</span>
                  )}
                </Link>
              )}

              <NotificationCenter />

              {/* User Dropdown */}
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="user-menu-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  id="user-menu-btn"
                >
                  <div className="avatar avatar-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.firstName} />
                    ) : (
                      getInitials(user?.firstName, user?.lastName)
                    )}
                  </div>
                  <span className="user-name">
                    {user?.fullName?.split(" ")[0] ||
                      user?.firstName ||
                      user?.name?.split(" ")[0] ||
                      "Tài khoản"}
                  </span>
                  <FiChevronDown size={18} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu animate-scale-in">
                    <div className="dropdown-header">
                      <div className="avatar">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.firstName} />
                        ) : (
                          getInitials(
                            user?.firstName,
                            user?.lastName,
                            user?.name,
                            user?.fullName,
                          )
                        )}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {getDisplayName(user)}
                        </div>
                        <div className="text-sm text-muted">{user?.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to={getDashboardRoute()}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiBarChart2 size={18} /> Dashboard
                    </Link>
                    <Link
                      to={ROUTES.PROFILE}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <FiUser size={18} /> Hồ sơ cá nhân
                    </Link>
                    {user?.role === ROLES.STUDENT && (
                      <>
                        <Link
                          to={ROUTES.STUDENT_COURSES}
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiBook size={18} /> Khóa học của tôi
                        </Link>
                        <Link
                          to={ROUTES.STUDENT_ORDERS}
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiFileText size={18} /> Lịch sử đơn hàng
                        </Link>
                        <Link
                          to={ROUTES.WISHLIST}
                          className="dropdown-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiHeart size={18} /> Danh sách yêu thích
                        </Link>
                      </>
                    )}
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item danger"
                      onClick={handleLogout}
                    >
                      <FiLogOut size={18} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="btn btn-ghost btn-sm">
                Đăng nhập
              </Link>
              <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm">
                Đăng ký miễn phí
              </Link>
            </>
          )}

          {/* Mobile Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="mobile-menu animate-fade-in">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
          </form>
          <Link to={ROUTES.COURSES} className="mobile-link">
            Khóa học
          </Link>
          {!isAuthenticated ? (
            <>
              <Link to={ROUTES.LOGIN} className="mobile-link">
                Đăng nhập
              </Link>
              <Link to={ROUTES.REGISTER} className="mobile-link">
                Đăng ký miễn phí
              </Link>
            </>
          ) : (
            <>
              <Link to={getDashboardRoute()} className="mobile-link">
                Dashboard
              </Link>
              <Link to={ROUTES.PROFILE} className="mobile-link">
                Hồ sơ cá nhân
              </Link>
              <button className="mobile-link danger" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
