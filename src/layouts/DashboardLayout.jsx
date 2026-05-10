import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { authService } from "../services/authService";
import { ROUTES, ROLES } from "../utils/constants";
import { getInitials, getDisplayName } from "../utils/helpers";
import "./DashboardLayout.css";

// ── Instructor nav items (icons as inline SVGs, no emoji) ──
const getInstructorNavItems = () => [
  {
    path: ROUTES.INSTRUCTOR_DASHBOARD,
    label: "Tổng quan",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_COURSES,
    label: "Khóa học",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_CREATE_COURSE,
    label: "Tạo khóa học",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_STUDENTS,
    label: "Học viên",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_REVENUE,
    label: "Thu nhập",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    path: ROUTES.INSTRUCTOR_QA,
    label: "Hỏi & Đáp",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.PROFILE,
    label: "Hồ sơ",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

// ── Admin nav items ──
const getAdminNavItems = () => [
  {
    path: ROUTES.ADMIN_DASHBOARD,
    label: "Tổng quan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_USERS,
    label: "Người dùng",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_TEACHERS,
    label: "Giảng viên",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="11" cy="7" r="4" />
        <path d="M18 8l4 4-4 4" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_COURSES,
    label: "Khóa học",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_CATEGORIES,
    label: "Danh mục",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_WITHDRAWALS,
    label: "Rút tiền",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_NOTIFICATIONS,
    label: "Thông báo",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
  },
  {
    path: ROUTES.ADMIN_PROFILE,
    label: "Hồ sơ",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const studentNavItems = [
  { path: ROUTES.STUDENT_DASHBOARD, label: "Dashboard" },
  { path: ROUTES.STUDENT_COURSES, label: "Khóa học của tôi" },
  { path: ROUTES.STUDENT_ORDERS, label: "Đơn hàng" },
  { path: ROUTES.WISHLIST, label: "Yêu thích" },
  { path: ROUTES.STUDENT_CERTIFICATES, label: "Chứng chỉ" },
];

// ── UserAvatar: shared component ──
const UserAvatar = ({ user, size = "md" }) => {
  const initials = getInitials(
    user?.firstName,
    user?.lastName,
    user?.name,
    user?.fullName,
  );
  const sizeClass =
    size === "sm" ? "avatar-sm" : size === "lg" ? "avatar-lg" : "";
  if (user?.avatar) {
    return (
      <img src={user.avatar} alt={initials} className={`avatar ${sizeClass}`} />
    );
  }
  return <div className={`avatar ${sizeClass}`}>{initials}</div>;
};

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    navigate(ROUTES.HOME);
  };

  const displayName = getDisplayName(user);
  const isStudent = user?.role === ROLES.STUDENT;

  // ─── STUDENT LAYOUT (header-only, no sidebar) ───
  if (isStudent) {
    return (
      <div className="student-layout">
        <header className="student-header">
          <div className="student-header-container">
            {/* Logo */}
            <Link to={ROUTES.HOME} className="student-logo">
              <svg
                className="logo-icon-svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7V12C2 18.6 7.1 24 12 24C16.9 24 22 18.6 22 12V7L12 2Z" />
              </svg>
              <span className="logo-text">EduLearn</span>
            </Link>

            {/* Nav */}
            <nav className="student-nav">
              {studentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`student-nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="student-actions">
              {/* User dropdown */}
              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <UserAvatar user={user} size="sm" />
                  <span className="student-username">
                    {user?.fullName?.split(" ")[0] ||
                      user?.firstName ||
                      user?.name?.split(" ")[0] ||
                      "Tài khoản"}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown animate-scale-in">
                    <div className="dropdown-user-header">
                      <UserAvatar user={user} />
                      <div>
                        <div className="dropdown-name">{displayName}</div>
                        <div className="dropdown-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      to={ROUTES.PROFILE}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to={ROUTES.STUDENT_DASHBOARD}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                      Dashboard
                    </Link>
                    <Link
                      to={ROUTES.STUDENT_COURSES}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                      Khóa học của tôi
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item danger"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="student-main">{children}</main>
      </div>
    );
  }

  // ─── INSTRUCTOR / ADMIN LAYOUT (sidebar) ───
  const isAdmin = user?.role === ROLES.ADMIN;
  const navItems = isAdmin ? getAdminNavItems() : getInstructorNavItems();
  const homePath = isAdmin ? ROUTES.ADMIN_DASHBOARD : ROUTES.HOME;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarCollapsed ? "collapsed" : ""} ${isAdmin ? "admin-sidebar" : "instructor-sidebar"}`}
      >
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to={homePath} className="sidebar-logo">
            <div className="logo-icon">E</div>
            {!sidebarCollapsed && <span className="logo-text">EduLearn</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            id="sidebar-toggle"
            title={sidebarCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {sidebarCollapsed ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
          </button>
        </div>

        {/* User profile */}
        {!sidebarCollapsed ? (
          <div className="sidebar-user">
            <UserAvatar user={user} />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{displayName}</div>
              <div className="sidebar-user-role">
                {user?.role === ROLES.INSTRUCTOR
                  ? "Giảng viên"
                  : "Quản trị viên"}
              </div>
            </div>
          </div>
        ) : (
          <div className="sidebar-user collapsed">
            <UserAvatar user={user} size="sm" />
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <span className="nav-icon">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="nav-label">{item.label}</span>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="nav-active-dot" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">

          <button className="sidebar-nav-item danger" onClick={handleLogout}>
            <span className="nav-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {!sidebarCollapsed && <span className="nav-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              id="topbar-sidebar-toggle"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="topbar-breadcrumb">
              {navItems.find((i) => i.path === location.pathname)?.label ||
                "Dashboard"}
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-user">
              <UserAvatar user={user} size="sm" />
              <span className="topbar-name">{displayName}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
