import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ROUTES } from '../../utils/constants';
import { adminDashboardService, adminCourseService, adminWithdrawalService } from '../../services/adminService';
import './Admin.css';

/* ─── Helpers ─── */
const formatChartDateLabel = (label) => (label || '').toString().slice(5);

const formatLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateKey = (value) => {
  if (!value) return '';
  if (typeof value === 'string') {
    const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
    if (dateOnly) return dateOnly;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatLocalDateKey(date);
};

const buildLast30DaysSeries = (series = [], valueField = 'amount') => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sourceByDate = new Map();
  (Array.isArray(series) ? series : []).forEach((item) => {
    const key = toDateKey(item?.date || item?.label);
    if (!key) return;
    sourceByDate.set(key, Number(item?.[valueField] || item?.amount || item?.count || 0));
  });
  return Array.from({ length: 30 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (29 - index));
    const key = formatLocalDateKey(day);
    return { label: key, [valueField]: sourceByDate.get(key) ?? 0 };
  });
};

const formatCompact = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace('.0', '')}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (num >= 1_000) return `${Math.round(num / 1_000)}K`;
  return `${num}`;
};

/* ─── Chart.js lazy loader ─── */
let chartJsLoaded = false;
let chartJsPromise = null;
const loadChartJs = () => {
  if (chartJsLoaded) return Promise.resolve(window.Chart);
  if (chartJsPromise) return chartJsPromise;
  chartJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
    script.onload = () => { chartJsLoaded = true; resolve(window.Chart); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return chartJsPromise;
};

/* ─── Shared chart theme ─── */
const getChartTheme = () => {
  const isDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return {
    isDark,
    gridColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    tickColor: isDark ? '#6b7280' : '#9ca3af',
    tooltipBg: isDark ? '#1e293b' : '#0f172a',
  };
};

const sharedScales = (theme, yFormatter) => ({
  x: {
    grid: { color: theme.gridColor, drawBorder: false },
    border: { display: false },
    ticks: {
      color: theme.tickColor,
      font: { size: 10, family: 'inherit' },
      maxRotation: 0,
      autoSkip: false,
      callback(val, i, ticks) {
        if (i === 0 || i === ticks.length - 1 || i % 5 === 0) return this.getLabelForValue(val);
        return '';
      },
    },
  },
  y: {
    grid: { color: theme.gridColor, drawBorder: false },
    border: { display: false },
    beginAtZero: true,
    ticks: {
      color: theme.tickColor,
      font: { size: 10, family: 'inherit' },
      callback: yFormatter,
    },
  },
});

const tooltipPlugin = (theme, formatter) => ({
  backgroundColor: theme.tooltipBg,
  titleColor: '#94a3b8',
  bodyColor: '#f8fafc',
  padding: { x: 12, y: 10 },
  cornerRadius: 8,
  displayColors: false,
  callbacks: {
    title: (ctx) => formatChartDateLabel(ctx[0].label),
    label: (ctx) => formatter(ctx.raw),
  },
});

/* ─── Revenue Chart ─── */
const RevenueChart = ({ data = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const values = data.map((d) => Number(d.amount || 0));
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 0);
  const min = Math.min(...values.filter((v) => v > 0), 0);

  const fmtVND = (v) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  const fmtCompact = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M₫`;
    if (v >= 1_000) return `${Math.round(v / 1_000)}K₫`;
    return `${v}₫`;
  };

  useEffect(() => {
    if (!data.length) return;
    let cancelled = false;
    loadChartJs().then((Chart) => {
      if (cancelled || !canvasRef.current) return;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const theme = getChartTheme();
      const ctx = canvasRef.current.getContext('2d');
      const labels = data.map((d) => d.label);

      const gradient = ctx.createLinearGradient(0, 0, 0, 200);
      gradient.addColorStop(0, 'rgba(37,99,235,0.22)');
      gradient.addColorStop(1, 'rgba(37,99,235,0)');

      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            data: values,
            borderColor: '#2563eb',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#2563eb',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
            tension: 0.35,
            fill: true,
            backgroundColor: gradient,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: tooltipPlugin(theme, fmtVND),
          },
          scales: sharedScales(theme, fmtCompact),
          interaction: { mode: 'index', intersect: false },
        },
      });
    });
    return () => { cancelled = true; };
  }, [data]);

  useEffect(() => () => { chartRef.current?.destroy(); }, []);

  return (
    <div className="chartjs-card">
      <div className="chartjs-card-header">
        <div>
          <h3 className="chartjs-title">Doanh thu hàng ngày</h3>
          <p className="chartjs-sub">30 ngày gần nhất · VND</p>
        </div>
      </div>
      <div className="chartjs-kpi-row">
        <div className="chartjs-kpi">
          <span>Tổng</span>
          <strong>{fmtVND(total)}</strong>
        </div>
        <div className="chartjs-kpi">
          <span>Cao nhất</span>
          <strong>{fmtVND(max)}</strong>
        </div>
        <div className="chartjs-kpi">
          <span>Thấp nhất</span>
          <strong>{fmtVND(min)}</strong>
        </div>
      </div>
      <div className="chartjs-canvas-wrap">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Biểu đồ đường doanh thu hàng ngày 30 ngày gần nhất"
        >
          Dữ liệu doanh thu 30 ngày.
        </canvas>
      </div>
      <div className="chartjs-legend-row">
        <span className="chartjs-axis-label">Đơn vị: VND</span>
        <span className="chartjs-legend-item">
          <span className="chartjs-legend-dot" style={{ background: '#2563eb' }} />
          Doanh thu
        </span>
        <span className="chartjs-axis-label" style={{ textAlign: 'right' }}>30 ngày gần nhất</span>
      </div>
    </div>
  );
};

/* ─── Enrollment Chart ─── */
const EnrollmentChart = ({ data = [] }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const values = data.map((d) => Number(d.count || 0));
  const total = values.reduce((a, b) => a + b, 0);
  const max = Math.max(...values, 0);
  const nonZero = values.filter((v) => v > 0);
  const avg = nonZero.length ? (total / nonZero.length).toFixed(1) : '0';

  useEffect(() => {
    if (!data.length) return;
    let cancelled = false;
    loadChartJs().then((Chart) => {
      if (cancelled || !canvasRef.current) return;
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }

      const theme = getChartTheme();
      const ctx = canvasRef.current.getContext('2d');
      const labels = data.map((d) => d.label);

      chartRef.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx: c, chartArea } = chart;
              if (!chartArea) return 'rgba(124,58,237,0.75)';
              const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              g.addColorStop(0, 'rgba(124,58,237,0.85)');
              g.addColorStop(1, 'rgba(124,58,237,0.25)');
              return g;
            },
            hoverBackgroundColor: '#7c3aed',
            borderRadius: 4,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 700, easing: 'easeOutQuart' },
          plugins: {
            legend: { display: false },
            tooltip: tooltipPlugin(
              theme,
              (v) => `${Number(v).toLocaleString('vi-VN')} lượt`,
            ),
          },
          scales: sharedScales(theme, (v) => (Number.isInteger(v) ? v : '')),
          interaction: { mode: 'index', intersect: false },
        },
      });
    });
    return () => { cancelled = true; };
  }, [data]);

  useEffect(() => () => { chartRef.current?.destroy(); }, []);

  return (
    <div className="chartjs-card">
      <div className="chartjs-card-header">
        <div>
          <h3 className="chartjs-title">Ghi danh hàng ngày</h3>
          <p className="chartjs-sub">30 ngày gần nhất · lượt</p>
        </div>
      </div>
      <div className="chartjs-kpi-row">
        <div className="chartjs-kpi">
          <span>Tổng</span>
          <strong>{total.toLocaleString('vi-VN')} lượt</strong>
        </div>
        <div className="chartjs-kpi">
          <span>Cao nhất</span>
          <strong>{max.toLocaleString('vi-VN')} lượt</strong>
        </div>
        <div className="chartjs-kpi">
          <span>Trung bình</span>
          <strong>{parseFloat(avg).toLocaleString('vi-VN')} lượt</strong>
        </div>
      </div>
      <div className="chartjs-canvas-wrap">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Biểu đồ cột ghi danh hàng ngày 30 ngày gần nhất"
        >
          Dữ liệu ghi danh 30 ngày.
        </canvas>
      </div>
      <div className="chartjs-legend-row">
        <span className="chartjs-axis-label">Đơn vị: lượt ghi danh</span>
        <span className="chartjs-legend-item">
          <span className="chartjs-legend-dot" style={{ background: '#7c3aed' }} />
          Ghi danh
        </span>
        <span className="chartjs-axis-label" style={{ textAlign: 'right' }}>30 ngày gần nhất</span>
      </div>
    </div>
  );
};

/* ─── Donut Chart (Canvas) ─── */
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

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg-donut') || '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#1f2937';
    ctx.font = `bold 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total.toLocaleString(), cx, cy - 6);
    ctx.fillStyle = '#9ca3af';
    ctx.font = `10px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
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

/* ─── Main Dashboard ─── */
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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, pendingCoursesRes, withdrawalsRes, platformFeeRes, reportRes] =
        await Promise.allSettled([
          adminDashboardService.getStats(),
          adminCourseService.searchManagedCourses({ status: 'PENDING_REVIEW' }, { page: 1, pageSize: 5 }),
          adminWithdrawalService.getPending({ page: 0, size: 5 }),
          adminDashboardService.getPlatformFee(),
          adminDashboardService.getReport({ year: reportYear, month: reportMonth }),
        ]);

      if (dashRes.status === 'fulfilled') setDashData(dashRes.value.data);
      if (pendingCoursesRes.status === 'fulfilled') setRecentCourses(pendingCoursesRes.value.data.content);
      if (withdrawalsRes.status === 'fulfilled') setRecentWithdrawals(withdrawalsRes.value.data.content);
      if (platformFeeRes.status === 'fulfilled') {
        const fee = platformFeeRes.value.data?.platformFeePercent;
        setPlatformFee(fee ?? '');
      }
      if (reportRes.status === 'fulfilled') setReportData(reportRes.value.data || null);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [reportYear, reportMonth]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

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
        <div className="spinner" />
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

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
  const last30DaysRevenue = buildLast30DaysSeries(chartDataSource?.dailyRevenue, 'amount');
  const last30DaysEnrollments = buildLast30DaysSeries(chartDataSource?.dailyEnrollments, 'count');

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tổng quan</h1>
          <p className="admin-page-subtitle">Chào mừng bạn đến bảng điều khiển quản trị</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={fetchDashboardData}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Làm mới
        </button>
      </div>

      {error && <div className="admin-error-banner"><p>{error}</p></div>}

      {/* Monthly Report */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3>Báo cáo theo tháng / năm</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="form-input"
              value={reportMonth}
              onChange={(e) => setReportMonth(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
            <select
              className="form-input"
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
            >
              {selectableYears.map((y) => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: '16px 20px' }}>
          <div className="admin-report-kpi-grid">
            <div className="admin-report-kpi">
              <span>Doanh thu kỳ</span>
              <strong>{formatPrice(reportData?.revenue ?? 0)}</strong>
            </div>
            <div className="admin-report-kpi">
              <span>Đơn hoàn tất</span>
              <strong>{formatNumber(reportData?.completedOrders ?? 0)}</strong>
            </div>
            <div className="admin-report-kpi">
              <span>Học viên mới</span>
              <strong>{formatNumber(reportData?.newStudents ?? 0)}</strong>
            </div>
            <div className="admin-report-kpi">
              <span>Giảng viên mới</span>
              <strong>{formatNumber(reportData?.newInstructors ?? 0)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Platform fee */}
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="admin-card-header">
          <h3>Cấu hình hệ thống</h3>
        </div>
        <div className="admin-card-body" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label className="form-label" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
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
                  style={{ width: '100%', paddingRight: 30 }}
                />
                <span style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontWeight: 500,
                }}>%</span>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleUpdatePlatformFee}
                disabled={savingPlatformFee}
              >
                {savingPlatformFee ? 'Đang lưu...' : 'Lưu & thông báo'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card stat-purple">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

      {/* Charts */}
      {chartDataSource && (
        <div className="admin-dashboard-grid" style={{ marginBottom: 24 }}>
          {last30DaysRevenue.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-body" style={{ padding: '20px 20px 16px' }}>
                <RevenueChart data={last30DaysRevenue} />
              </div>
            </div>
          )}

          {last30DaysEnrollments.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-body" style={{ padding: '20px 20px 16px' }}>
                <EnrollmentChart data={last30DaysEnrollments} />
              </div>
            </div>
          )}

          {dashData?.courseStatusDistribution?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Phân bố trạng thái khóa học</h3>
              </div>
              <div className="admin-card-body" style={{ padding: 20 }}>
                <DonutChart data={dashData.courseStatusDistribution} />
              </div>
            </div>
          )}

          {dashData?.orderStatusDistribution?.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header">
                <h3>Phân bố trạng thái đơn hàng</h3>
              </div>
              <div className="admin-card-body" style={{ padding: 20 }}>
                <DonutChart data={dashData.orderStatusDistribution} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Selling Courses */}
      {chartDataSource?.topSellingCourses?.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header">
            <h3>Khóa học bán chạy nhất</h3>
          </div>
          <div className="admin-card-body">
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>KHÓA HỌC</th>
                    <th style={{ textAlign: 'center' }}>ĐÃ BÁN</th>
                    <th style={{ textAlign: 'center' }}>HỌC VIÊN</th>
                    <th style={{ textAlign: 'center' }}>ĐÁNH GIÁ</th>
                    <th style={{ textAlign: 'right' }}>DOANH THU</th>
                  </tr>
                </thead>
                <tbody>
                  {chartDataSource.topSellingCourses.map((course, idx) => (
                    <tr key={course.courseId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ fontWeight: 700, color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                      <td><div className="admin-course-title">{course.courseTitle}</div></td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{formatNumber(course.soldItems)}</td>
                      <td style={{ textAlign: 'center' }}>{formatNumber(course.totalStudents)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className="admin-rating">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          {course.avgRating?.toFixed(1) || '—'}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
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

      {/* Recent grid */}
      <div className="admin-dashboard-grid">
        {/* Pending Courses */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Khóa học chờ duyệt</h3>
            <Link to={ROUTES.ADMIN_COURSES} className="admin-card-link">Xem tất cả</Link>
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
            <Link to={ROUTES.ADMIN_WITHDRAWALS} className="admin-card-link">Xem tất cả</Link>
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
