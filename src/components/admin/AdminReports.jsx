import React, { useEffect, useMemo, useState } from "react";
import { adminDashboardService } from "../../services/adminService";
import { formatPrice } from "../../utils/helpers";
import Loading from "../common/Loading";
import "../student/Dashboard.css";

const PERIOD_OPTIONS = [7, 30, 90];

const AdminReports = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminDashboardService.getReport(days);
        setReport(res.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [days]);

  const stats = useMemo(
    () => [
      { label: "Doanh thu", value: formatPrice(report?.revenue || 0) },
      { label: "Don hoan tat", value: report?.completedOrders || 0 },
      { label: "Hoc vien moi", value: report?.newStudents || 0 },
      { label: "Giang vien moi", value: report?.newInstructors || 0 },
      { label: "Khoa hoc moi", value: report?.newCourses || 0 },
      { label: "Ghi danh moi", value: report?.newEnrollments || 0 },
    ],
    [report],
  );

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-section">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h1>Bao cao he thong</h1>
          <div style={{ display: "flex", gap: 8 }}>
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option}
                className={`btn btn-${days === option ? "primary" : "outline"} btn-sm`}
                onClick={() => setDays(option)}
              >
                {option} ngay
              </button>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 0, color: "#666" }}>
          Tu {report?.fromDate || "-"} den {report?.toDate || "-"}
        </p>
        <div className="stats-grid">
          {stats.map((item) => (
            <div className="stat-card" key={item.label}>
              <div className="stat-label">{item.label}</div>
              <div className="stat-number">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Top khoa hoc</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Khoa hoc</th>
              <th>Luot ban</th>
              <th>Hoc vien</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {(report?.topSellingCourses || []).map((course) => (
              <tr key={course.courseId}>
                <td>{course.courseTitle}</td>
                <td>{course.totalSales || 0}</td>
                <td>{course.totalStudents || 0}</td>
                <td>{formatPrice(course.totalRevenue || 0)}</td>
              </tr>
            ))}
            {(report?.topSellingCourses || []).length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
                  Chua co du lieu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
