import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminUserService } from '../../services/adminService';
import './Admin.css';

const ROLE_MAP = {
  STUDENT: { cls: 'badge-info', label: 'Học viên' },
  TEACHER: { cls: 'badge-primary', label: 'Giảng viên' },
  INSTRUCTOR: { cls: 'badge-primary', label: 'Giảng viên' },
  ADMIN: { cls: 'badge-danger', label: 'Quản trị viên' },
};

const STATUS_MAP = {
  ACTIVE: { cls: 'badge-success', label: 'Hoạt động' },
  INACTIVE: { cls: 'badge-gray', label: 'Không hoạt động' },
};

const Badge = ({ map, value }) => {
  const info = map[value] || { cls: 'badge-gray', label: value || 'Khác' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

const fmtDate = (d) => !d ? '' : new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [active, setActive] = useState('');
  const [isLocked, setIsLocked] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // Actions
  const [actionLoading, setActionLoading] = useState(null);
  const [modal, setModal] = useState({ type: null, data: null });
  const [lockReason, setLockReason] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        size: pageSize,
        keyword: keyword || undefined,
        roleCode: roleCode || undefined,
        active: active || undefined,
        isLocked: isLocked === '' ? undefined : isLocked === 'true'
      };
      const res = await adminUserService.getAll(params);
      setUsers(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, keyword, roleCode, active, isLocked]);

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const openModal = async (type, user) => { 
    setModal({ type, data: user }); 
    setLockReason(''); 
    
    // Fetch user details if opening detail modal
    if (type === 'detail') {
      try {
        const res = await adminUserService.getById(user.id);
        setModal({ type, data: res.data });
      } catch (e) {
        toast.error('Không thể tải chi tiết người dùng');
        closeModal();
      }
    }
  };
  
  const closeModal = () => setModal({ type: null, data: null });

  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(0);
  };

  const doAction = async (action, successMsg) => {
    const user = modal.data;
    setActionLoading(user.id);
    try {
      await action(user);
      toast.success(successMsg);
      closeModal();
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (user) => {
    setActionLoading(user.id);
    try {
      await adminUserService.updateStatus(user.id, user.active !== 'ACTIVE');
      toast.success('Cập nhật trạng thái thành công');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleLock = () => {
    const isCurrentlyLocked = modal.data.isLocked;
    if (!isCurrentlyLocked && !lockReason.trim()) {
      toast.warning('Vui lòng nhập lý do khóa tài khoản');
      return;
    }
    doAction(
      (u) => adminUserService.lockAccount(u.id, !isCurrentlyLocked, lockReason),
      isCurrentlyLocked ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản'
    );
  };

  const handleDelete = () => {
    doAction(
      (u) => adminUserService.delete(u.id),
      'Đã xóa người dùng thành công'
    );
  };

  /* ── Modals ── */
  const renderDetailModal = (user) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Chi tiết người dùng</h3>
          <button className="admin-modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-detail-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
             {user.avatar ? (
                <img src={user.avatar} alt={user.fullName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
             ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
             )}
             <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{user.fullName}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{user.email}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <Badge map={ROLE_MAP} value={user.roleCode} />
                  {user.isLocked && <span className="badge badge-danger">Đã khóa</span>}
                  <Badge map={STATUS_MAP} value={user.active} />
                </div>
             </div>
          </div>
          
          <div className="admin-detail-grid">
            <div className="admin-detail-item"><label>Số điện thoại</label><p>{user.phoneNumber || '—'}</p></div>
            <div className="admin-detail-item"><label>Giới tính</label><p>{user.gender === 'MALE' ? 'Nam' : user.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</p></div>
            <div className="admin-detail-item"><label>Trạng thái xác minh</label><p>{user.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</p></div>
            <div className="admin-detail-item"><label>Ngày tham gia</label><p>{fmtDate(user.createdAt)}</p></div>
            <div className="admin-detail-item"><label>Cập nhật lần cuối</label><p>{fmtDate(user.updatedAt)}</p></div>
            
            {(user.roleCode === 'TEACHER' || user.roleCode === 'INSTRUCTOR') && user.totalRevenue !== undefined && (
              <div className="admin-detail-item"><label>Tổng doanh thu</label><p className="text-bold text-success">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.totalRevenue)}</p></div>
            )}
            
            {user.bio && <div className="admin-detail-item full"><label>Tiểu sử</label><p>{user.bio}</p></div>}
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
          {!user.isLocked ? (
            <button className="btn btn-warning" onClick={() => { closeModal(); setTimeout(() => openModal('lock', user), 10); }}>Khóa tài khoản</button>
          ) : (
            <button className="btn btn-success" onClick={() => { closeModal(); setTimeout(() => openModal('unlock', user), 10); }}>Mở khóa tài khoản</button>
          )}
          <button className="btn btn-danger" onClick={() => { closeModal(); setTimeout(() => openModal('delete', user), 10); }}>Xóa tài khoản</button>
        </div>
      </div>
    </div>
  );

  const renderLockModal = (user, isUnlock) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isUnlock ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</h3>
          <button className="admin-modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-reject-info">
            <p>Bạn có chắc chắn muốn {isUnlock ? 'mở khóa' : 'khóa'} tài khoản <strong>{user.email}</strong>?</p>
          </div>
          {!isUnlock && (
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Lý do khóa <span style={{color:'red'}}>*</span></label>
              <textarea className="form-input" value={lockReason} onChange={e => setLockReason(e.target.value)}
                placeholder="VD: Vi phạm điều khoản dịch vụ" rows={3} autoFocus style={{ width: '100%', resize: 'vertical' }} />
            </div>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className={`btn ${isUnlock ? 'btn-success' : 'btn-danger'}`} onClick={handleToggleLock} disabled={actionLoading}>
            {actionLoading ? 'Đang xử lý...' : (isUnlock ? 'Mở khóa' : 'Khóa tài khoản')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderDeleteModal = (user) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal admin-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header"><h3>Xóa người dùng</h3><button className="admin-modal-close" onClick={closeModal}>✕</button></div>
        <div className="admin-modal-body">
          <div className="admin-confirm-content">
            <div className="admin-confirm-icon danger">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <p>Bạn có chắc chắn muốn xóa tài khoản <strong>{user.email}</strong>?</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Hành động này không thể hoàn tác.</p>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Hủy</button>
          <button className="btn btn-danger" onClick={handleDelete} disabled={actionLoading}>
            {actionLoading ? 'Đang xử lý...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
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
          <h1 className="admin-page-title">Quản lý người dùng</h1>
          <p className="admin-page-subtitle">Xem, tìm kiếm, và quản lý tất cả tài khoản trong hệ thống</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="admin-search-input" placeholder="Tìm kiếm theo tên, email, SĐT..." value={keyword} onChange={handleSearch} />
        </div>
        <div className="admin-filters">
          <select className="admin-filter-select" value={roleCode} onChange={e => { setRoleCode(e.target.value); setCurrentPage(0); }}>
            <option value="">Tất cả vai trò</option>
            <option value="STUDENT">Học viên</option>
            <option value="INSTRUCTOR">Giảng viên</option>
            <option value="ADMIN">Quản trị viên</option>
          </select>
          <select className="admin-filter-select" value={active} onChange={e => { setActive(e.target.value); setCurrentPage(0); }}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Không hoạt động</option>
          </select>
          <select className="admin-filter-select" value={isLocked} onChange={e => { setIsLocked(e.target.value); setCurrentPage(0); }}>
            <option value="">Tình trạng khóa</option>
            <option value="false">Bình thường</option>
            <option value="true">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading-inline"><div className="spinner spinner-sm"></div><span>Đang tải...</span></div>
          ) : users.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <p>Không tìm thấy người dùng nào</p>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Tình trạng</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-list-avatar">
                           {user.avatar ? (
                             <img src={user.avatar} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                           ) : (
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                           )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{user.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.phoneNumber || '—'}</td>
                    <td><Badge map={ROLE_MAP} value={user.roleCode} /></td>
                    <td>
                        <label className="switch" title="Chuyển đổi trạng thái">
                            <input 
                                type="checkbox" 
                                checked={user.active === 'ACTIVE'}
                                onChange={() => handleToggleStatus(user)}
                                disabled={actionLoading === user.id}
                            />
                            <span className="slider round"></span>
                        </label>
                    </td>
                    <td>
                        {user.isLocked ? (
                            <span className="badge badge-danger">Đã khóa</span>
                        ) : (
                            <span className="badge badge-success">Bình thường</span>
                        )}
                    </td>
                    <td>{fmtDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn view" onClick={() => openModal('detail', user)} title="Xem chi tiết">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                        </button>
                        <button className="admin-action-btn edit" onClick={() => openModal(user.isLocked ? 'unlock' : 'lock', user)} title={user.isLocked ? "Mở khóa" : "Khóa tài khoản"}>
                           {user.isLocked ? (
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                           ) : (
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                           )}
                        </button>
                        <button className="admin-action-btn reject" onClick={() => openModal('delete', user)} title="Xóa">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
          <div className="admin-toolbar-info">Tổng: <strong>{totalElements}</strong> người dùng</div>
          {renderPagination()}
        </div>
      </div>

      {modal.type === 'detail' && modal.data && renderDetailModal(modal.data)}
      {modal.type === 'lock' && modal.data && renderLockModal(modal.data, false)}
      {modal.type === 'unlock' && modal.data && renderLockModal(modal.data, true)}
      {modal.type === 'delete' && modal.data && renderDeleteModal(modal.data)}
    </div>
  );
};

export default AdminUsers;
