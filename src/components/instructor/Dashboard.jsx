import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import { dashboardService } from "../../services/dashboardService";
import { ROUTES } from "../../utils/constants";
import {
  FaBook,
  FaCheck,
  FaUsers,
  FaStar,
  FaPlus,
  FaListUl,
} from "react-icons/fa";
import Loading from "../../components/common/Loading";
import "../student/Dashboard.css";

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        courseService
          .getByInstructor(user.id)
          .then((res) => setCourses(res.data?.content || res.data || []))
          .catch(() => setCourses([])),
        dashboardService
          .getInstructorDashboard()
          .then((res) => setDashboardStats(res.data || null))
          .catch(() => setDashboardStats(null)),
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    {
      label: "Tổng khóa học",
      value: dashboardStats?.totalCourses ?? courses.length,
      icon: <FaBook size={24} />,
      color: "var(--primary)",
    },
    {
      label: "Đang hoạt động",
      value: dashboardStats?.publishedCourses ?? courses.filter((c) => c.status === "PUBLISHED").length,
      icon: <FaCheck size={24} />,
      color: "var(--success)",
    },
    {
      label: "Tổng học sinh",
      value: dashboardStats?.totalStudents ?? courses.reduce((a, c) => a + (c.totalStudents || 0), 0),
      icon: <FaUsers size={24} />,
      color: "var(--secondary)",
    },
    {
      label: "Đánh giá TB",
      value: (
        courses.reduce((a, c) => a + (c.avgRating || 0), 0) /
        Math.max(courses.length, 1)
      ).toFixed(1),
      icon: <FaStar size={24} />,
      color: "var(--warning)",
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1>
            Dashboard Giảng viên{" "}
            <FaStar size={28} style={{ display: "inline" }} />
          </h1>
          <p>Quản lý khóa học và theo dõi tiến độ học sinh của bạn.</p>
        </div>
        <Link
          to={ROUTES.INSTRUCTOR_CREATE_COURSE}
          className="btn btn-primary"
          style={{ background: "white", color: "var(--primary)" }}
        >
          <FaPlus style={{ marginRight: "6px" }} /> Tạo khóa học mới
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ "--stat-color": s.color }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Khóa học của tôi</h2>
          <Link to={ROUTES.INSTRUCTOR_COURSES} className="see-all-link">
            Quản lý tất cả →
          </Link>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaBook size={48} />
            </div>
            <h3>Chưa có khóa học nào</h3>
            <p>Tạo khóa học đầu tiên của bạn ngay hôm nay</p>
            <Link
              to={ROUTES.INSTRUCTOR_CREATE_COURSE}
              className="btn btn-primary"
            >
              Tạo khóa học
            </Link>
          </div>
        ) : (
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-xl)",
              border: "1px solid var(--border-color)",
              overflow: "hidden",
            }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Trạng thái</th>
                  <th>Học sinh</th>
                  <th>Đánh giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{
                              width: "48px",
                              height: "36px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                        <span style={{ fontWeight: "600", fontSize: "14px" }}>
                          {course.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${course.status === "PUBLISHED" ? "badge-success" : course.status === "DRAFT" ? "badge-gray" : "badge-warning"}`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td>{course.totalStudents || 0}</td>
                    <td>
                      {course.avgRating ? (
                        <>
                          <FaStar style={{ marginRight: "4px" }} />{" "}
                          {course.avgRating.toFixed(1)}
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Link
                          to={`/courses/${course.slug}`}
                          className="btn btn-ghost btn-sm"
                        >
                          Xem
                        </Link>
                        <Link
                          to={`${ROUTES.INSTRUCTOR_CHAPTERS.replace(":courseId", course.id)}`}
                          className="btn btn-outline btn-sm"
                          title="Quản lý chương"
                        >
                          <FaListUl style={{ marginRight: "4px" }} />
                          Chương
                        </Link>
                        <Link
                          to={`${ROUTES.INSTRUCTOR_EDIT_COURSE.replace(":courseId", course.id)}`}
                          className="btn btn-outline btn-sm"
                        >
                          Sửa
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;



