import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminWithdrawalService } from '../../services/adminService';
import './Admin.css';

const STATUS_TABS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xử lý' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'REJECTED', label: 'Đã từ chối' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_MAP = {
  PENDING: { cls: 'badge-warning', label: 'Chờ xử lý' },
  APPROVED: { cls: 'badge-primary', label: 'Đã duyệt' },
  COMPLETED: { cls: 'badge-success', label: 'Hoàn thành' },
  REJECTED: { cls: 'badge-error', label: 'Đã từ chối' },
  CANCELLED: { cls: 'badge-gray', label: 'Đã hủy' },
};

const TYPE_MAP = {
  EARNINGS: { cls: 'badge-primary', label: 'Rút tiền' },
  SETTLEMENT: { cls: 'badge-info', label: 'Thanh toán' },
  REFUND: { cls: 'badge-error', label: 'Hoàn tiền' },
};

const Badge = ({ map, value }) => {
  const info = map[value] || { cls: 'badge-gray', label: value };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

const fmt = (p) => !p ? '0 ₫' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const fmtDate = (d) => !d ? '' : new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);

  const [modal, setModal] = useState({ type: null, data: null });
  const [rejectReason, setRejectReason] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const pageSummary = withdrawals.reduce(
    (acc, wd) => {
      const net = Number(wd.netAmount || 0);
      if (wd.type === 'EARNINGS' && (wd.status === 'PENDING' || wd.status === 'APPROVED')) {
        acc.pendingPayout += net;
      }
      if (wd.type === 'EARNINGS' && wd.status === 'COMPLETED') {
        acc.completedPayout += net;
      }
      if (wd.type === 'REFUND') {
        acc.refundAdjustment += net;
      }
      return acc;
    },
    { pendingPayout: 0, completedPayout: 0, refundAdjustment: 0 }
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, size: pageSize };
      const res = statusFilter
        ? await adminWithdrawalService.getByStatus(statusFilter, params)
        : await adminWithdrawalService.getAll(params);
      setWithdrawals(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      toast.error('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, currentPage, pageSize]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatusFilter = (v) => { setStatusFilter(v); setCurrentPage(0); };
  const openModal = (type, data) => { setModal({ type, data }); setRejectReason(''); setTransactionId(''); };
  const closeModal = () => setModal({ type: null, data: null });

  const doAction = async (action, successMsg) => {
    const wd = modal.data;
    setActionLoading(wd.id);
    try {
      await action(wd);
      toast.success(successMsg);
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = () => doAction(
    (wd) => adminWithdrawalService.approve(wd.id),
    'Đã phê duyệt yêu cầu rút tiền'
  );

  const handleReject = () => {
    if (!rejectReason.trim()) { toast.warning('Vui lòng nhập lý do từ chối'); return; }
    doAction(
      (wd) => adminWithdrawalService.reject(wd.id, rejectReason),
      'Đã từ chối yêu cầu rút tiền'
    );
  };

  const handleComplete = () => {
    if (!transactionId.trim()) { toast.warning('Vui lòng nhập mã giao dịch'); return; }
    doAction(
      (wd) => adminWithdrawalService.complete(wd.id, transactionId),
      'Đã hoàn thành yêu cầu rút tiền'
    );
  };

  /* ── Detail Modal ── */
  const DetailModal = ({ wd }) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Chi tiết yêu cầu rút tiền</h3>
          <button className="admin-modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-detail-grid">
            <div className="admin-detail-item"><label>Loại</label><p><Badge map={TYPE_MAP} value={wd.type} /></p></div>
            <div className="admin-detail-item"><label>Trạng thái</label><p><Badge map={STATUS_MAP} value={wd.status} /></p></div>
            <div className="admin-detail-item"><label>Chủ TK</label><p>{wd.accountHolder || '—'}</p></div>
            <div className="admin-detail-item"><label>Ngân hàng</label><p>{wd.bankName || '—'}</p></div>
            <div className="admin-detail-item"><label>STK</label><p><code className="admin-account-num">{wd.bankAccount || '—'}</code></p></div>
            <div className="admin-detail-item"><label>Ngày yêu cầu</label><p>{fmtDate(wd.createdAt)}</p></div>

            <div className="admin-detail-item"><label>Số tiền yêu cầu</label><p className="text-bold">{fmt(wd.requestedAmount)}</p></div>
            <div className="admin-detail-item"><label>Hoa hồng ({wd.commissionRate || 0}%)</label><p>{fmt(wd.commissionAmount)}</p></div>
            <div className="admin-detail-item"><label>Thực nhận</label><p className="text-bold admin-amount-lg">{fmt(wd.netAmount)}</p></div>
            {wd.availableAt && <div className="admin-detail-item"><label>Khả dụng lúc</label><p>{fmtDate(wd.availableAt)}</p></div>}

            {wd.reason && <div className="admin-detail-item full"><label>Lý do</label><p>{wd.reason}</p></div>}
            {wd.rejectReason && <div className="admin-detail-item full"><label className="text-danger">Lý do từ chối</label><p className="admin-rejection-reason">{wd.rejectReason}</p></div>}
            {wd.transactionId && <div className="admin-detail-item full"><label>Mã giao dịch</label><p><code className="admin-account-num">{wd.transactionId}</code></p></div>}
            {wd.approvedAt && <div className="admin-detail-item"><label>Ngày duyệt</label><p>{fmtDate(wd.approvedAt)}</p></div>}
            {wd.completedAt && <div className="admin-detail-item"><label>Ngày hoàn thành</label><p>{fmtDate(wd.completedAt)}</p></div>}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
          {wd.status === 'PENDING' && wd.type === 'EARNINGS' && (
            <>
              <button className="btn btn-danger" onClick={() => openModal('reject', wd)}>Từ chối</button>
              <button className="btn btn-success" onClick={() => openModal('approve', wd)}>Phê duyệt</button>
            </>
          )}
          {wd.status === 'APPROVED' && wd.type === 'EARNINGS' && (
            <button className="btn btn-primary" onClick={() => openModal('complete', wd)}>Hoàn thành chuyển tiền</button>
          )}
        </div>
      </div>
    </div>
  );

  /* ── Approve Confirm ── */
  const ApproveModal = ({ wd }) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header"><h3>Xác nhận phê duyệt</h3><button className="admin-modal-close" onClick={closeModal}>✕</button></div>
        <div className="admin-modal-body">
          <div className="admin-confirm-content">
            <div className="admin-confirm-icon success">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <p>Phê duyệt yêu cầu rút tiền:</p>
            <div className="admin-confirm-details">
              <div className="admin-confirm-row"><span>Chủ TK:</span><strong>{wd.accountHolder}</strong></div>
              <div className="admin-confirm-row"><span>Số tiền:</span><strong>{fmt(wd.requestedAmount)}</strong></div>
              {Number(wd.commissionAmount || 0) > 0 && (
                <div className="admin-confirm-row"><span>Hoa hồng:</span><strong>-{fmt(wd.commissionAmount)}</strong></div>
              )}
              <div className="admin-confirm-row"><span>Thực nhận:</span><strong className="text-success">{fmt(wd.netAmount)}</strong></div>
              <div className="admin-confirm-row"><span>Ngân hàng:</span><strong>{wd.bankName} - {wd.bankAccount}</strong></div>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn-success" onClick={handleApprove} disabled={actionLoading} id="btn-confirm-approve-wd">
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận phê duyệt'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Reject Modal ── */
  const RejectModal = ({ wd }) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header"><h3>Từ chối yêu cầu</h3><button className="admin-modal-close" onClick={closeModal}>✕</button></div>
        <div className="admin-modal-body">
          <div className="admin-reject-info">
            <p>Từ chối yêu cầu <strong>{fmt(wd.requestedAmount)}</strong> của <strong>{wd.accountHolder}</strong></p>
          </div>
          <div className="form-group">
            <label className="form-label">Lý do từ chối <span>*</span></label>
            <textarea className="form-textarea" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="VD: Thông tin tài khoản ngân hàng không chính xác" rows={4} id="input-reject-wd-reason" autoFocus />
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading} id="btn-confirm-reject-wd">
            {actionLoading ? 'Đang xử lý...' : 'Từ chối yêu cầu'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Complete Modal (enter transactionId) ── */
  const CompleteModal = ({ wd }) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header"><h3>Hoàn thành chuyển tiền</h3><button className="admin-modal-close" onClick={closeModal}>✕</button></div>
        <div className="admin-modal-body">
          <div className="admin-reject-info" style={{ background: 'var(--success-alpha)', borderColor: 'rgba(34,197,94,0.2)' }}>
            <p style={{ color: 'var(--success-dark)' }}>
              Xác nhận đã chuyển <strong>{fmt(wd.netAmount)}</strong> cho <strong>{wd.accountHolder}</strong>
              <br /><small>{wd.bankName} - {wd.bankAccount}</small>
            </p>
          </div>
          <div className="form-group">
            <label className="form-label">Mã giao dịch ngân hàng <span>*</span></label>
            <input type="text" className="form-input" value={transactionId} onChange={e => setTransactionId(e.target.value)}
              placeholder="Nhập mã giao dịch từ ngân hàng..." id="input-transaction-id" autoFocus />
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn-success" onClick={handleComplete} disabled={actionLoading} id="btn-confirm-complete-wd">
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
          </button>
        </div>
      </div>
    </div>
  );

  /* ── Action buttons for each row ── */
  const RowActions = ({ wd }) => (
    <div className="admin-actions">
      <button className="admin-action-btn view" onClick={() => openModal('detail', wd)} title="Xem chi tiết">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      </button>
      {wd.status === 'PENDING' && wd.type === 'EARNINGS' && (
        <>
          <button className="admin-action-btn approve" onClick={() => openModal('approve', wd)} disabled={actionLoading === wd.id} title="Phê duyệt">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
          </button>
          <button className="admin-action-btn reject" onClick={() => openModal('reject', wd)} title="Từ chối">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </>
      )}
      {wd.status === 'APPROVED' && wd.type === 'EARNINGS' && (
        <button className="admin-action-btn approve" onClick={() => openModal('complete', wd)} title="Hoàn thành chuyển tiền">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </button>
      )}
    </div>
  );

  /* ── Pagination ── */
  const Pagination = () => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i)
      .filter(p => p === 0 || p === totalPages - 1 || Math.abs(p - currentPage) <= 1);
    return (
      <div className="admin-pagination">
        <button className="admin-page-btn" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>← Trước</button>
        <div className="admin-page-numbers">
          {pages.map((pg, idx, arr) => (
            <React.Fragment key={pg}>
              {idx > 0 && arr[idx - 1] !== pg - 1 && <span className="admin-page-ellipsis">...</span>}
              <button className={`admin-page-btn ${pg === currentPage ? 'active' : ''}`} onClick={() => setCurrentPage(pg)}>{pg + 1}</button>
            </React.Fragment>
          ))}
        </div>
        <button className="admin-page-btn" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Sau →</button>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý rút tiền</h1>
          <p className="admin-page-subtitle">Phê duyệt, hoàn thành và quản lý yêu cầu rút tiền của giảng viên</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-filters">
          {STATUS_TABS.map(t => (
            <button key={t.value} className={`admin-filter-tab ${statusFilter === t.value ? 'active' : ''}`}
              onClick={() => handleStatusFilter(t.value)}>{t.label}</button>
          ))}
        </div>
        <div className="admin-toolbar-info">Tổng: <strong>{totalElements}</strong> yêu cầu</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 12, marginBottom: 12 }}>
        <div className="admin-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Chi trả chờ xử lý (trang hiện tại)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(pageSummary.pendingPayout)}</div>
        </div>
        <div className="admin-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Chi trả đã hoàn tất (trang hiện tại)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(pageSummary.completedPayout)}</div>
        </div>
        <div className="admin-card" style={{ padding: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Điều chỉnh hoàn tiền (trang hiện tại)</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{fmt(pageSummary.refundAdjustment)}</div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading-inline"><div className="spinner spinner-sm"></div><span>Đang tải...</span></div>
          ) : withdrawals.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              <p>Không có yêu cầu rút tiền nào</p>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Chủ tài khoản</th>
                  <th>Số tiền</th>
                  <th>Hoa hồng</th>
                  <th>Thực nhận</th>
                  <th>Ngân hàng</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(wd => (
                  <tr key={wd.id} className={wd.type === 'SETTLEMENT' ? 'row-settlement' : ''}>
                    <td><Badge map={TYPE_MAP} value={wd.type} /></td>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-list-avatar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        </div>
                        <span>{wd.accountHolder || '—'}</span>
                      </div>
                    </td>
                    <td className="text-bold">{fmt(wd.requestedAmount)}</td>
                    <td>{fmt(wd.commissionAmount)}</td>
                    <td className="text-bold admin-amount">{fmt(wd.netAmount)}</td>
                    <td>{wd.bankName ? `${wd.bankName}` : '—'}</td>
                    <td><Badge map={STATUS_MAP} value={wd.status} /></td>
                    <td>{fmtDate(wd.createdAt)}</td>
                    <td><RowActions wd={wd} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination />
      </div>

      {/* Render active modal */}
      {modal.type === 'detail' && modal.data && <DetailModal wd={modal.data} />}
      {modal.type === 'approve' && modal.data && <ApproveModal wd={modal.data} />}
      {modal.type === 'reject' && modal.data && <RejectModal wd={modal.data} />}
      {modal.type === 'complete' && modal.data && <CompleteModal wd={modal.data} />}
    </div>
  );
};

export default AdminWithdrawals;
