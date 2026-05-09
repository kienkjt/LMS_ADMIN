import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../services/enrollmentService";
import { ROUTES } from "../../utils/constants";
import Loading from "../common/Loading";
import "./Dashboard.css";

const StudentDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      enrollmentService
        .getStudentCoursesPaginated({ page: 1, size: 6 })
        .then((res) => setEnrollments(res.data?.content || res.data || []))
        .catch(() => setEnrollments([]))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    {
      label: "Khóa học",
      value: enrollments.length,
      color: "indigo",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      ),
    },
    {
      label: "Đang theo học",
      value: enrollments.filter((e) => !e.completedAt && e.progressPercent > 0)
        .length,
      color: "blue",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
      ),
    },
    {
      label: "Hoàn thành",
      value: enrollments.filter((e) => e.completedAt).length,
      color: "green",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <path d="M22 4L12 14.01l-3-3"></path>
        </svg>
      ),
    },
    {
      label: "Ngày hoạt động",
      value: "2",
      color: "orange",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
      ),
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content-std">
          <h1>Chào mừng trở lại, {user?.firstName}!</h1>
          <p>
            Tiếp tục hành trình học tập và nâng cao kỹ năng của bạn mỗi ngày.
          </p>
          <div className="welcome-actions">
            <Link to={ROUTES.COURSES} className="btn-explore-courses">
              Khám phá khóa học
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card-std color-${s.color}`}>
            <div className="stat-header">
              <div className="stat-icon-std">{s.icon}</div>
            </div>
            <div className="stat-body">
              <div className="stat-value-std">{s.value}</div>
              <div className="stat-label-std">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Course Section */}
      <div className="courses-section">
        <div className="section-header-std">
          <h2>Khóa học của tôi</h2>
          <Link to={ROUTES.STUDENT_COURSES} className="link-see-all">
            Xem tất cả
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="empty-state-std">
            <div className="empty-icon-std">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </div>
            <h3>Chưa có khóa học nào</h3>
            <p>
              Bắt đầu hành trình của bạn bằng cách đăng ký một khóa học mới.
            </p>
            <Link to={ROUTES.COURSES} className="btn-explore-courses outline">
              Tìm khóa học
            </Link>
          </div>
        ) : (
          <div className="course-grid-std">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id} className="course-card-std">
                <div className="course-thumbnail-std">
                  {enrollment.course?.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                    />
                  ) : (
                    <div className="placeholder-thumbnail">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="18"
                          height="18"
                          rx="2"
                          ry="2"
                        ></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="course-info-std">
                  <h4
                    className="course-title-std"
                    title={enrollment.course?.title}
                  >
                    {enrollment.course?.title || "Chưa có tên khóa học"}
                  </h4>
                  <div className="course-instructor">
                    {enrollment.course?.instructorName ||
                      "Giảng viên chưa cập nhật"}
                  </div>
                  <div className="course-progress-wrapper">
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${enrollment.progressPercent || 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>
                        {Math.round(enrollment.progressPercent || 0)}% hoàn
                        thành
                      </span>
                      {enrollment.completedAt && (
                        <span className="status-completed">Chứng chỉ</span>
                      )}
                    </div>
                  </div>
                  <div className="course-action">
                    <Link
                      to={`/learn/${enrollment.courseId}`}
                      className="btn-continue-learning"
                    >
                      {enrollment.progressPercent > 0
                        ? "Tiếp tục học"
                        : "Bắt đầu học"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
