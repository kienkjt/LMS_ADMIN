import React, { useEffect, useMemo, useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import { formatPrice } from "../../utils/helpers";
import Loading from "../common/Loading";
import "../student/Dashboard.css";

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

const InstructorReports = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getInstructorReport({ year, month });
        setReport(res.data || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, month]);

  const stats = useMemo(
    () => [
      { label: "Doanh thu", value: formatPrice(report?.revenue || 0) },
      { label: "Đơn bán", value: report?.soldItems || 0 },
      { label: "Ghi danh mới", value: report?.newEnrollments || 0 },
      { label: "Khóa học mới", value: report?.newCourses || 0 },
    ],
    [report],
  );
  const revenueSeries = Array.isArray(report?.dailyRevenue) ? report.dailyRevenue : [];
  const enrollmentSeries = Array.isArray(report?.dailyEnrollments) ? report.dailyEnrollments : [];
  const maxRevenue = Math.max(...revenueSeries.map((item) => Number(item?.amount || 0)), 0);
  const maxEnrollment = Math.max(...enrollmentSeries.map((item) => Number(item?.count || 0)), 0);

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-section">
        <div className="section-header" style={{ marginBottom: 16 }}>
          <h1>Báo cáo giảng viên</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <select className="form-input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
            <select className="form-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p style={{ marginTop: 0, color: "#666" }}>
          Từ {report?.fromDate || "-"} đến {report?.toDate || "-"}
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
          <h2>Biểu đồ doanh thu theo ngày</h2>
        </div>
        {revenueSeries.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu doanh thu trong kỳ đã chọn.</div>
        ) : (
          <div className="instructor-chart">
            {revenueSeries.map((item) => {
              const value = Number(item?.amount || 0);
              const width = maxRevenue > 0 ? Math.max(4, (value / maxRevenue) * 100) : 0;
              return (
                <div className="chart-row" key={item.label}>
                  <div className="chart-label">{item.label}</div>
                  <div className="chart-track"><div className="chart-bar" style={{ width: `${width}%` }} /></div>
                  <div className="chart-value">{formatPrice(value)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Biểu đồ ghi danh theo ngày</h2>
        </div>
        {enrollmentSeries.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu ghi danh trong kỳ đã chọn.</div>
        ) : (
          <div className="instructor-chart">
            {enrollmentSeries.map((item) => {
              const value = Number(item?.count || 0);
              const width = maxEnrollment > 0 ? Math.max(4, (value / maxEnrollment) * 100) : 0;
              return (
                <div className="chart-row" key={item.label}>
                  <div className="chart-label">{item.label}</div>
                  <div className="chart-track"><div className="chart-bar chart-bar-alt" style={{ width: `${width}%` }} /></div>
                  <div className="chart-value">{value}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Top khóa học</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Khóa học</th>
              <th>Lượt bán</th>
              <th>Học viên</th>
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
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorReports;
