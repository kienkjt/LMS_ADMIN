import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import { adminNotificationService, adminUserService } from '../../services/adminService';
import './Admin.css';

const NOTIFICATION_TYPES = [
  { value: 'SYSTEM', label: 'Hệ thống', color: '#6b7280' },
  { value: 'COURSE_APPROVED', label: 'Duyệt khóa học', color: '#10b981' },
  { value: 'COURSE_REJECTED', label: 'Từ chối khóa học', color: '#ef4444' },
  { value: 'NEW_ENROLLMENT', label: 'Ghi danh mới', color: '#3b82f6' },
  { value: 'NEW_REVIEW', label: 'Đánh giá mới', color: '#f59e0b' },
  { value: 'PAYMENT_SUCCESS', label: 'Thanh toán thành công', color: '#10b981' },
  { value: 'PAYMENT_FAILED', label: 'Thanh toán thất bại', color: '#ef4444' },
  { value: 'QUIZ_RESULT', label: 'Kết quả quiz', color: '#8b5cf6' },
  { value: 'CERTIFICATE_ISSUED', label: 'Cấp chứng chỉ', color: '#06b6d4' },
  { value: 'AI_RECOMMENDATION', label: 'Gợi ý AI', color: '#ec4899' },
];

const getTypeInfo = (type) => NOTIFICATION_TYPES.find(t => t.value === type) || NOTIFICATION_TYPES[0];

const getTypeIcon = (type) => {
  switch (type) {
    case 'COURSE_APPROVED':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case 'COURSE_REJECTED':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>;
    case 'NEW_ENROLLMENT':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>;
    case 'PAYMENT_SUCCESS':
    case 'PAYMENT_FAILED':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
    case 'NEW_REVIEW':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    case 'CERTIFICATE_ISSUED':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></svg>;
    case 'QUIZ_RESULT':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
  }
};

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [createForm, setCreateForm] = useState({
    type: 'SYSTEM',
    title: '',
    message: '',
  });

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUser, setIsSearchingUser] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (!userSearchTerm.trim()) {
      setUserSearchResults([]);
      setIsSearchingUser(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    setIsSearchingUser(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await adminUserService.getAll({ keyword: userSearchTerm, size: 5 });
        setUserSearchResults(res.data?.content || []);
      } catch (err) {
        console.error('Lỗi khi tìm kiếm người dùng:', err);
      } finally {
        setIsSearchingUser(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [userSearchTerm]);

  const handleSelectUser = (user) => {
    if (!selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setUserSearchTerm('');
    setUserSearchResults([]);
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminNotificationService.getAll({ page, size: 10 });
      setNotifications(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (err) {
      toast.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await adminNotificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n));
      toast.success('Đã đánh dấu đã đọc');
    } catch (err) {
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await adminNotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() })));
      toast.success('Đã đánh dấu tất cả đã đọc');
    } catch (err) {
      toast.error('Không thể đánh dấu tất cả');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0 || !createForm.title || !createForm.message) {
      toast.error('Vui lòng chọn người nhận, tiêu đề và nội dung');
      return;
    }
    
    const ids = selectedUsers.map(u => u.id);

    setCreating(true);
    try {
      const payload = {
        type: createForm.type,
        title: createForm.title,
        message: createForm.message,
      };

      if (ids.length === 1) {
        payload.userId = ids[0];
      } else {
        payload.userIds = ids;
      }

      await adminNotificationService.create(payload);
      toast.success('Tạo thông báo thành công');
      setShowCreateModal(false);
      setCreateForm({ type: 'SYSTEM', title: '', message: '' });
      setSelectedUsers([]);
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo thông báo');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffH < 24) return `${diffH} giờ trước`;
    if (diffD < 7) return `${diffD} ngày trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    for (let i = 0; i < totalPages; i++) {
      if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
        pages.push(
          <button key={i} className={`admin-page-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>
            {i + 1}
          </button>
        );
      } else if (i === page - 2 || i === page + 2) {
        pages.push(<span key={i} className="admin-page-ellipsis">…</span>);
      }
    }
    return (
      <div className="admin-pagination">
        <button className="admin-page-btn" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
          ‹
        </button>
        <div className="admin-page-numbers">{pages}</div>
        <button className="admin-page-btn" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
          ›
        </button>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Thông báo</h1>
          <p className="admin-page-subtitle">Quản lý và gửi thông báo cho người dùng • {totalElements} thông báo</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll || notifications.every(n => n.read)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            Đọc tất cả
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreateModal(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Gửi thông báo
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="admin-card">
        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-inline">
              <div className="spinner" style={{ width: 20, height: 20 }}></div>
              <span>Đang tải...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <p>Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="notification-list">
              {notifications.map((notif) => {
                const typeInfo = getTypeInfo(notif.type);
                return (
                  <div
                    key={notif.id}
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  >
                    <div className="notification-icon-wrap" style={{ '--notif-color': typeInfo.color }}>
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-header-row">
                        <span className="notification-type-badge" style={{ background: typeInfo.color + '18', color: typeInfo.color }}>
                          {typeInfo.label}
                        </span>
                        <span className="notification-time">{formatDate(notif.createdAt)}</span>
                      </div>
                      <div className="notification-title">{notif.title}</div>
                      <div className="notification-message">{notif.message}</div>
                      {notif.referenceId && (
                        <div className="notification-ref">
                          Ref: {notif.referenceType} #{notif.referenceId?.substring(0, 8)}
                        </div>
                      )}
                    </div>
                    <div className="notification-actions">
                      {!notif.read && (
                        <button
                          className="admin-action-btn approve"
                          title="Đánh dấu đã đọc"
                          onClick={() => handleMarkAsRead(notif.id)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        {renderPagination()}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Gửi thông báo cho người dùng</h3>
              <button className="admin-modal-close" onClick={() => setShowCreateModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="admin-modal-body">
                <div className="form-group" style={{ marginBottom: 16, position: 'relative' }}>
                  <label className="form-label">Người nhận <span style={{ color: 'var(--error)' }}>*</span></label>
                  
                  {/* Selected Users Chips */}
                  {selectedUsers.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                      {selectedUsers.map(user => (
                        <div key={user.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', background: 'var(--primary-light)',
                          color: 'var(--primary)', borderRadius: 16, fontSize: '0.85rem'
                        }}>
                          <span>{user.email || user.fullName || user.id.substring(0,8)}</span>
                          <button type="button" onClick={() => handleRemoveUser(user.id)} style={{
                            background: 'transparent', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0, display: 'flex'
                          }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Search Input */}
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tìm kiếm người dùng theo tên, email..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                  
                  {/* Dropdown Results */}
                  {userSearchTerm.trim() && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 6, marginTop: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      maxHeight: 200, overflowY: 'auto'
                    }}>
                      {isSearchingUser ? (
                        <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-secondary)' }}>Đang tìm kiếm...</div>
                      ) : userSearchResults.length > 0 ? (
                        userSearchResults.map(user => (
                          <div 
                            key={user.id} 
                            style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}
                            onClick={() => handleSelectUser(user)}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          >
                            <div style={{ fontWeight: 500 }}>{user.fullName || user.firstName + ' ' + user.lastName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-secondary)' }}>Không tìm thấy kết quả</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Loại thông báo <span style={{ color: 'var(--error)' }}>*</span></label>
                  <select
                    className="admin-filter-select"
                    style={{ width: '100%' }}
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {NOTIFICATION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Tiêu đề <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Tiêu đề thông báo (tối đa 200 ký tự)"
                    maxLength={200}
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Nội dung <span style={{ color: 'var(--error)' }}>*</span></label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 100, resize: 'vertical' }}
                    placeholder="Nội dung chi tiết của thông báo..."
                    value={createForm.message}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </div>

              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Đang gửi...' : 'Gửi thông báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
