import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../utils/constants';
import { adminDashboardService, adminCourseService, adminWithdrawalService } from '../../services/adminService';
import './Admin.css';
const formatChartDateLabel = (label) => (label || '').toString().slice(5);

// ─── Simple Bar/Line Chart Component ───
const MiniChart = ({ data = [], type = 'bar', color = '#7c3aed', height = 120 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const values = data.map(d => Number(d.amount || d.count || 0));
    const rawMaxVal = Math.max(...values, 1);
    const maxVal = type === 'line' ? rawMaxVal * 1.2 : rawMaxVal;
    const padding = { top: 10, bottom: 24, left: 8, right: 8 };
    const chartW = rect.width - padding.left - padding.right;
    const chartH = rect.height - padding.top - padding.bottom;

    if (type === 'bar') {
      const barGap = 4;
      const barW = Math.max(4, (chartW - barGap * (values.length - 1)) / values.length);
      values.forEach((val, i) => {
        const x = padding.left + i * (barW + barGap);
        const barH = (val / maxVal) * chartH;
        const y = padding.top + chartH - barH;
        const gradient = ctx.createLinearGradient(x, y, x, y + barH);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '44');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
        ctx.fill();
      });
    } else {
      // Line chart
      const stepX = chartW / Math.max(values.length - 1, 1);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      values.forEach((val, i) => {
        const x = padding.left + i * stepX;
        const y = padding.top + chartH - (val / maxVal) * chartH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      // Area fill
      const lastX = padding.left + (values.length - 1) * stepX;
      ctx.lineTo(lastX, padding.top + chartH);
      ctx.lineTo(padding.left, padding.top + chartH);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, color + '30');
      gradient.addColorStop(1, color + '05');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    const labelStep = Math.max(1, Math.floor(data.length / 6));
    data.forEach((d, i) => {
      if (i % labelStep === 0 || i === data.length - 1) {
        const x = type === 'bar'
          ? padding.left + i * ((chartW - 4 * (values.length - 1)) / values.length + 4) + ((chartW - 4 * (values.length - 1)) / values.length) / 2
          : padding.left + i * (chartW / Math.max(values.length - 1, 1));
        ctx.fillText(formatChartDateLabel(d.label) || d.label || '', x, rect.height - 4);
      }
    });
  }, [data, type, color, height]);

  return <canvas ref={canvasRef} style={{ width: '100%', height }} />;
};

// ─── Donut Chart Component ───
const TimeSeriesRevenueChart = ({ data = [], height = 220 }) => {
  if (!Array.isArray(data) || data.length === 0) return null;

  const values = data.map((item) => Number(item.amount || 0));
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const pointStep = 100 / Math.max(values.length - 1, 1);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((rate) => Math.round(maxVal * rate));
  const linePoints = values.map((value, index) => {
    const x = index * pointStep;
    const y = 100 - (value / maxVal) * 100;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,100 ${linePoints} 100,100`;

  return (
    <div className="timeseries-chart-card enrollment-chart-card">
      <div className="timeseries-chart-kpis">
        <div><span>Tổng</span><strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</strong></div>
        <div><span>Cao nhất</span><strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(maxVal)}</strong></div>
        <div><span>Thấp nhất</span><strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minVal)}</strong></div>
      </div>
      <div className="timeseries-chart-body" style={{ height }}>
        <div className="timeseries-y-axis">
          {yTicks.slice().reverse().map((tick) => (
            <span key={tick}>{(tick / 1000000).toFixed(0)}M</span>
          ))}
        </div>
        <div className="timeseries-canvas-wrap">
          <svg style={{ width: '100%', height: '100%', display: 'block' }}>
            <defs>
              <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="1" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {[20, 40, 60, 80].map((line) => (
              <line key={line} x1="0%" y1={`${line}%`} x2="100%" y2={`${line}%`} className="timeseries-grid-line" />
            ))}
            {values.map((value, index) => {
              const n = values.length || 1;
              const slotW = 100 / n;
              const barW = Math.min(slotW * 0.5, 8);
              const x = index * slotW + (slotW - barW) / 2;
              const barH = (value / maxVal) * 100;
              const y = 100 - barH;
              if (barH === 0) return null;
              return (
                <rect 
                  key={index} 
                  x={`${x}%`} 
                  y={`${y}%`} 
                  width={`${barW}%`} 
                  height={`${barH}%`} 
                  fill="url(#revenueBarGradient)" 
                  rx="3"
                />
              );
            })}
          </svg>
        </div>
      </div>
      <div className="timeseries-x-axis">
        {data.map((item, index) => (
          <span key={`${item.label}-${index}`}>{formatChartDateLabel(item.label)}</span>
        ))}
      </div>
      <div className="chart-meta-row">
        <span className="chart-axis-label">Đơn vị: VND</span>
        <span className="chart-legend"><span className="chart-legend-dot revenue"></span>Doanh thu</span>
        <span className="chart-axis-label">Theo ngày</span>
      </div>
    </div>
  );
};

const EnrollmentMiniChart = ({ data = [], height = 160 }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const values = data.map((d) => Number(d.count || d.amount || 0));
  const maxVal = Math.max(...values, 1) * 1.2;
  const yTicks = [0, 0.25, 0.5, 0.75, 1]
    .map((rate) => Math.round(maxVal * rate))
    .reverse();

  return (
    <div className="timeseries-chart-card">
      <div className="timeseries-chart-body" style={{ height }}>
        <div className="timeseries-y-axis">
          {yTicks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="timeseries-canvas-wrap">
          <MiniChart data={data} type="line" color="#3b82f6" height={height} />
        </div>
      </div>
      <div className="chart-meta-row">
        <span className="chart-axis-label">Đơn vị: lượt ghi danh</span>
        <span className="chart-legend"><span className="chart-legend-dot enrollment"></span>Ghi danh</span>
        <span className="chart-axis-label">Theo ngày</span>
      </div>
    </div>
  );
};

const DonutChart = ({ data = [], size = 140 }) => {
  const canvasRef = useRef(null);
  const colors = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const total = data.reduce((s, d) => s + (d.count || 0), 0) || 1;
    const cx = size / 2, cy = size / 2, r = size / 2 - 8;
    let startAngle = -Math.PI / 2;

    data.forEach((d, i) => {
      const slice = ((d.count || 0) / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      startAngle += slice;
    });

    // Center hole
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center text
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), cx, cy - 6);
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Tổng', cx, cy + 10);
  }, [data, size]);

  return (
    <div className="donut-chart-wrapper">
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: colors[i % colors.length] }} />
            <span className="donut-label">{d.description || d.status}</span>
            <span className="donut-count">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [dashData, setDashData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [platformFee, setPlatformFee] = useState('');
  const [savingPlatformFee, setSavingPlatformFee] = useState(false);
  const currentDate = new Date();
  const [reportYear, setReportYear] = useState(currentDate.getFullYear());
  const [reportMonth, setReportMonth] = useState(currentDate.getMonth() + 1);
  const selectableYears = Array.from({ length: 6 }, (_, i) => currentDate.getFullYear() - i);

  useEffect(() => {
    fetchDashboardData();
  }, [reportYear, reportMonth]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, pendingCoursesRes, withdrawalsRes, platformFeeRes, reportRes] = await Promise.allSettled([
        adminDashboardService.getStats(),
        adminCourseService.searchManagedCourses({ status: 'PENDING_REVIEW' }, { page: 1, pageSize: 5 }),
        adminWithdrawalService.getPending({ page: 0, size: 5 }),
        adminDashboardService.getPlatformFee(),
        adminDashboardService.getReport({ year: reportYear, month: reportMonth }),
      ]);

      if (dashRes.status === 'fulfilled') {
        setDashData(dashRes.value.data);
      } else {
        console.warn('Dashboard API failed, using fallback data');
      }

      if (pendingCoursesRes.status === 'fulfilled') {
        setRecentCourses(pendingCoursesRes.value.data.content);
      }
      if (withdrawalsRes.status === 'fulfilled') {
        setRecentWithdrawals(withdrawalsRes.value.data.content);
      }
      if (platformFeeRes.status === 'fulfilled') {
        const fee = platformFeeRes.value.data?.platformFeePercent;
        setPlatformFee(fee ?? '');
      }
      if (reportRes.status === 'fulfilled') {
        setReportData(reportRes.value.data || null);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    return Number(num).toLocaleString('vi-VN');
  };

  const handleUpdatePlatformFee = async () => {
    const feeNumber = Number(platformFee);
    if (!Number.isFinite(feeNumber) || feeNumber < 0 || feeNumber > 100) {
      toast.error('Phí nền tảng phải từ 0 đến 100');
      return;
    }
    try {
      setSavingPlatformFee(true);
      const res = await adminDashboardService.updatePlatformFee(feeNumber);
      setPlatformFee(res.data?.platformFeePercent ?? feeNumber);
      toast.success('Đã cập nhật phí nền tảng và gửi thông báo tới giảng viên');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Không thể cập nhật phí nền tảng');
    } finally {
      setSavingPlatformFee(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Determine stat values: prefer real dashboard API data, fallback to 0
  const stats = {
    totalUsers: dashData?.totalUsers ?? 0,
    totalStudents: dashData?.totalStudents ?? 0,
    totalInstructors: dashData?.totalInstructors ?? 0,
    totalCourses: dashData?.totalCourses ?? 0,
    publishedCourses: dashData?.publishedCourses ?? 0,
    pendingReviewCourses: dashData?.pendingReviewCourses ?? recentCourses.length,
    totalEnrollments: dashData?.totalEnrollments ?? 0,
    totalOrders: dashData?.totalOrders ?? 0,
    completedOrders: dashData?.completedOrders ?? 0,
    totalRevenue: dashData?.totalRevenue ?? 0,
    averageOrderValue: dashData?.averageOrderValue ?? 0,
  };
  const chartDataSource = reportData || dashData;

  return (
    <div className="admin-dashboard">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tổng quan</h1>
          <p className="admin-page-subtitle">Chào mừng bạn đến bảng điều khiển quản trị</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchDashboardData}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Làm mới
        </button>
      </div>

      {error && (
        <div className="admin-error-banner">
          <p>{error}</p>
        </div>
      )}

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3>Báo cáo theo tháng/năm</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select className="form-input" value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </select>
            <select className="form-input" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))}>
              {selectableYears.map((year) => (
                <option key={year} value={year}>Năm {year}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: '16px 20px' }}>
          <div className="admin-dashboard-grid">
            <div className="admin-stat-mini"><span>Doanh thu kỳ</span><strong>{formatPrice(reportData?.revenue ?? 0)}</strong></div>
            <div className="admin-stat-mini"><span>Đơn hoàn tất</span><strong>{formatNumber(reportData?.completedOrders ?? 0)}</strong></div>
            <div className="admin-stat-mini"><span>Học viên mới</span><strong>{formatNumber(reportData?.newStudents ?? 0)}</strong></div>
            <div className="admin-stat-mini"><span>Giảng viên mới</span><strong>{formatNumber(reportData?.newInstructors ?? 0)}</strong></div>
          </div>
        </div>
      </div>

      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3>Cấu hình hệ thống</h3>
        </div>
        <div className="admin-card-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="form-label" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Phí nền tảng (áp dụng cho tất cả giao dịch)
            </label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative', width: 160 }}>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  className="form-input"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  style={{ width: '100%', paddingRight: '30px' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontWeight: 500 }}>%</span>
              </div>
              <button className="btn btn-primary" onClick={handleUpdatePlatformFee} disabled={savingPlatformFee}>
                {savingPlatformFee ? 'Đang lưu...' : 'Lưu & thông báo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Stats Grid ─── */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-purple">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalUsers)}</div>
            <div className="stat-label">Tổng người dùng</div>
            <div className="stat-sub">
              <span>{formatNumber(stats.totalStudents)} Học viên</span>
              <span>•</span>
              <span>{formatNumber(stats.totalInstructors)} Giảng viên</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card stat-blue">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalCourses)}</div>
            <div className="stat-label">Tổng khóa học</div>
            <div className="stat-sub">
              <span>{formatNumber(stats.publishedCourses)} Đã xuất bản</span>
              <span>•</span>
              <span>{formatNumber(stats.pendingReviewCourses)} Chờ duyệt</span>
            </div>
          </div>
          <Link to={ROUTES.ADMIN_COURSES} className="stat-link">Xem tất cả →</Link>
        </div>

        <div className="admin-stat-card stat-green">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
            <div className="stat-label">Tổng doanh thu</div>
            <div className="stat-sub">
              <span>TB: {formatPrice(stats.averageOrderValue)}/đơn</span>
            </div>
          </div>
        </div>

        <div className="admin-stat-card stat-orange">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
            <div className="stat-label">Tổng đơn hàng</div>
            <div className="stat-sub">
              <span>{formatNumber(stats.completedOrders)} Hoàn thành</span>
              <span>•</span>
              <span>{formatNumber(stats.totalEnrollments)} Ghi danh</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Charts Row ─── */}
      {chartDataSource && (
        <div className="admin-dashboard-grid" style={{ marginBottom: 24 }}>
          {/* Daily Revenue Chart */}
          {chartDataSource.dailyRevenue?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Doanh thu hàng ngày</h3>
              </div>
              <div className="admin-card-body" style={{ padding: '16px 20px' }}>
                <TimeSeriesRevenueChart data={chartDataSource.dailyRevenue} height={220} />
              </div>
            </div>
          )}

          {/* Daily Enrollments Chart */}
          {chartDataSource.dailyEnrollments?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Ghi danh hàng ngày</h3>
              </div>
              <div className="admin-card-body" style={{ padding: '16px 20px' }}>
                <EnrollmentMiniChart data={chartDataSource.dailyEnrollments} height={160} />
              </div>
            </div>
          )}

          {/* Course Status Distribution */}
          {dashData.courseStatusDistribution?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Phân bố trạng thái khóa học</h3>
              </div>
              <div className="admin-card-body" style={{ padding: '20px' }}>
                <DonutChart data={dashData.courseStatusDistribution} />
              </div>
            </div>
          )}

          {/* Order Status Distribution */}
          {dashData.orderStatusDistribution?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Phân bố trạng thái đơn hàng</h3>
              </div>
              <div className="admin-card-body" style={{ padding: '20px' }}>
                <DonutChart data={dashData.orderStatusDistribution} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Top Selling Courses ─── */}
      {chartDataSource?.topSellingCourses?.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header">
            <h3>Khóa học bán chạy nhất</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-table-wrapper">
              <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>#</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>KHÓA HỌC</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>ĐÃ BÁN</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>HỌC VIÊN</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>ĐÁNH GIÁ</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px', background: 'var(--bg-tertiary)', fontSize: 11 }}>DOANH THU</th>
                  </tr>
                </thead>
                <tbody>
                  {chartDataSource.topSellingCourses.map((course, idx) => (
                    <tr key={course.courseId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div className="admin-course-title">{course.courseTitle}</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>{formatNumber(course.soldItems)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>{formatNumber(course.totalStudents)}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div className="admin-rating">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {course.avgRating?.toFixed(1) || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <span className="admin-amount">{formatPrice(course.revenue)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── Recent Data Grid ─── */}
      <div className="admin-dashboard-grid">
        {/* Pending Courses */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Khóa học chờ duyệt</h3>
            <Link to={ROUTES.ADMIN_COURSES} className="admin-card-link">
              Xem tất cả
            </Link>
          </div>
          <div className="admin-card-body">
            {recentCourses.length === 0 ? (
              <div className="admin-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Không có khóa học nào chờ duyệt</p>
              </div>
            ) : (
              <div className="admin-list">
                {recentCourses.map((course) => (
                  <div key={course.id} className="admin-list-item">
                    <div className="admin-list-item-info">
                      <div className="admin-list-item-thumb">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} />
                        ) : (
                          <div className="thumb-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="admin-list-item-title">{course.title}</div>
                        <div className="admin-list-item-meta">
                          <span className="badge badge-warning">Chờ duyệt</span>
                          <span>{formatPrice(course.price)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="admin-list-item-date">{formatDate(course.createdAt)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Yêu cầu rút tiền chờ xử lý</h3>
            <Link to={ROUTES.ADMIN_WITHDRAWALS} className="admin-card-link">
              Xem tất cả
            </Link>
          </div>
          <div className="admin-card-body">
            {recentWithdrawals.length === 0 ? (
              <div className="admin-empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <p>Không có yêu cầu rút tiền nào</p>
              </div>
            ) : (
              <div className="admin-list">
                {recentWithdrawals.map((wd) => (
                  <div key={wd.id} className="admin-list-item">
                    <div className="admin-list-item-info">
                      <div className="admin-list-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <div className="admin-list-item-title">{wd.accountHolder || 'Giảng viên'}</div>
                        <div className="admin-list-item-meta">
                          <span className="text-bold">{formatPrice(wd.requestedAmount)}</span>
                          <span>•</span>
                          <span>{wd.bankName}</span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-warning">Chờ xử lý</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
