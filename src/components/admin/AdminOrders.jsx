import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminOrderService } from '../../services/adminService';
import './Admin.css';

const STATUS_OPTIONS = ['', 'PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];

const STATUS_LABEL = {
  PENDING: 'Chờ thanh toán',
  COMPLETED: 'Đã thanh toán',
  CANCELLED: 'Đã hủy',
  REFUNDED: 'Đã hoàn tiền',
};

const fmtDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('vi-VN');
};

const fmtMoney = (value) => {
  const n = Number(value || 0);
  return `${n.toLocaleString('vi-VN')} đ`;
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminOrderService.list({ keyword, status, page, size });
      const pageData = res.data || {};
      setOrders(pageData.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [keyword, status, page, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchOrders]);

  const runRefund = async (order) => {
    const reason = window.prompt(`Nhập lý do hoàn tiền cho đơn ${order.orderCode || order.id}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Lý do không được để trống');
      return;
    }

    try {
      setActionLoading(order.id);
      await adminOrderService.refund(order.id, reason.trim());
      toast.success('Hoàn tiền thành công');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hoàn tiền đơn hàng');
    } finally {
      setActionLoading('');
    }
  };

  const runCancel = async (order) => {
    const reason = window.prompt(`Nhập lý do hủy đơn ${order.orderCode || order.id}:`);
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Lý do không được để trống');
      return;
    }

    try {
      setActionLoading(order.id);
      await adminOrderService.cancel(order.id, reason.trim());
      toast.success('Hủy đơn thành công');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Quản lý đơn hàng</h2>
          <p className="admin-page-subtitle">Tổng số: {totalElements} đơn hàng</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            className="admin-search-input"
            placeholder="Tìm theo mã đơn, tên hoặc email học viên..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
          />
        </div>
        
        <div className="admin-filters">
          <select
            className="admin-filter-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s || 'ALL'} value={s}>
                {s ? STATUS_LABEL[s] || s : 'Tất cả trạng thái'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          <table className="data-table admin-table">
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>HỌC VIÊN</th>
                <th>TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th>NGÀY TẠO</th>
                <th className="text-center">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-loading-inline">
                      <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                      Đang tải dữ liệu...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty-state">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <p>Không tìm thấy đơn hàng nào</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="admin-account-num">{order.orderCode || order.id}</span>
                    </td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-list-avatar">
                          {(order.studentName || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-category-name">{order.studentName || '-'}</div>
                          <div className="admin-cell-desc">{order.studentEmail || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-amount">{fmtMoney(order.finalAmount || order.totalAmount)}</span>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        backgroundColor: order.status === 'COMPLETED' ? 'var(--success-alpha)' : order.status === 'PENDING' ? 'var(--warning-alpha)' : order.status === 'CANCELLED' ? 'var(--error-alpha)' : 'var(--bg-tertiary)',
                        color: order.status === 'COMPLETED' ? 'var(--success-dark)' : order.status === 'PENDING' ? 'var(--warning-dark)' : order.status === 'CANCELLED' ? 'var(--error-dark)' : 'var(--text-secondary)'
                      }}>
                        {STATUS_LABEL[order.status] || order.status || '-'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-cell-desc">{fmtDate(order.createdAt)}</div>
                    </td>
                    <td>
                      <div className="admin-actions" style={{ justifyContent: 'center' }}>
                        {order.status === 'PENDING' && (
                          <button
                            className="admin-action-btn reject"
                            title="Hủy đơn"
                            onClick={() => runCancel(order)}
                            disabled={actionLoading === order.id}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                          </button>
                        )}
                        {order.status === 'COMPLETED' && (
                          <button
                            className="admin-action-btn edit"
                            title="Hoàn tiền"
                            onClick={() => runRefund(order)}
                            disabled={actionLoading === order.id}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="admin-pagination">
            <button
              className="admin-page-btn"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Trang trước
            </button>
            <div className="admin-page-numbers">
              <span className="admin-page-btn active">{page + 1}</span>
              <span className="admin-page-ellipsis">/</span>
              <span className="admin-page-btn">{Math.max(1, totalPages)}</span>
            </div>
            <button
              className="admin-page-btn"
              disabled={page >= Math.max(0, totalPages - 1)}
              onClick={() => setPage((p) => Math.min(Math.max(0, totalPages - 1), p + 1))}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
