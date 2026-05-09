import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminTeacherService } from '../../services/adminService';
import './Admin.css';

const STATUS_MAP = {
  ACTIVE: { cls: 'badge-success', label: 'Hoạt động' },
  INACTIVE: { cls: 'badge-gray', label: 'Không hoạt động' },
};

const Badge = ({ map, value }) => {
  const info = map[value] || { cls: 'badge-gray', label: value || 'Khác' };
  return <span className={`badge ${info.cls}`}>{info.label}</span>;
};

const fmtDate = (d) => !d ? '' : new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtVnd = (p) => !p ? '0 ₫' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [keyword, setKeyword] = useState('');
  const [active, setActive] = useState('');
  const [isLocked, setIsLocked] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const [modal, setModal] = useState({ type: null, data: null, stats: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        page: currentPage, 
        size: pageSize,
        keyword: keyword || undefined,
        active: active || undefined,
        isLocked: isLocked === '' ? undefined : isLocked === 'true'
      };
      const res = await adminTeacherService.getAll(params);
      setTeachers(res.data.content);
      setTotalPages(res.data.totalPages);
      setTotalElements(res.data.totalElements);
    } catch (e) {
      toast.error('Không thể tải danh sách giảng viên');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, keyword, active, isLocked]);

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchData]);

  const openModal = async (teacher) => { 
    setModal({ type: 'detail', data: teacher, stats: null });
    try {
      const [detailRes, statsRes] = await Promise.all([
        adminTeacherService.getById(teacher.id),
        adminTeacherService.getStatistics(teacher.id)
      ]);
      setModal({ type: 'detail', data: detailRes.data.user || detailRes.data, stats: statsRes.data });
    } catch (e) {
      toast.error('Không thể tải thông tin chi tiết');
    }
  };
  
  const closeModal = () => setModal({ type: null, data: null, stats: null });

  const handleSearch = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(0);
  };

  /* ── Modals ── */
  const DetailModal = ({ teacher, stats }) => (
    <div className="admin-modal-overlay" onClick={closeModal}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Chi tiết giảng viên</h3>
          <button className="admin-modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-detail-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
             {teacher.avatar ? (
                <img src={teacher.avatar} alt={teacher.fullName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
             ) : (
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-tertiary)' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
             )}
             <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem' }}>{teacher.fullName}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{teacher.email}</p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  {teacher.isLocked && <span className="badge badge-danger">Đã khóa</span>}
                  <Badge map={STATUS_MAP} value={teacher.active} />
                </div>
             </div>
          </div>
          
          <div className="admin-detail-grid">
            <div className="admin-detail-item"><label>Số điện thoại</label><p>{teacher.phoneNumber || '—'}</p></div>
            <div className="admin-detail-item"><label>Giới tính</label><p>{teacher.gender === 'MALE' ? 'Nam' : teacher.gender === 'FEMALE' ? 'Nữ' : 'Khác'}</p></div>
            <div className="admin-detail-item"><label>Trạng thái xác minh</label><p>{teacher.isVerified ? 'Đã xác minh' : 'Chưa xác minh'}</p></div>
            <div className="admin-detail-item"><label>Ngày tham gia</label><p>{fmtDate(teacher.createdAt)}</p></div>
            
            <div className="admin-detail-item full"><label>Tiểu sử</label><p>{teacher.bio || '—'}</p></div>
          </div>

          <h4 style={{ marginTop: '2rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Thống kê</h4>
          {stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
               <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary-color)' }}>{stats.courseCount || 0}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Khóa học</div>
               </div>
               <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--info-color)' }}>{stats.studentCount || 0}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Học viên</div>
               </div>
               <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40px' }}>{fmtVnd(stats.totalRevenue || teacher.totalRevenue)}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Tổng doanh thu</div>
               </div>
            </div>
          ) : (
            <div className="admin-loading-inline"><div className="spinner spinner-sm"></div><span>Đang tải thống kê...</span></div>
          )}
        </div>
        <div className="admin-modal-footer">
          <button className="btn btn-ghost" onClick={closeModal}>Đóng</button>
        </div>
      </div>
    </div>
  );

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
          <h1 className="admin-page-title">Quản lý giảng viên</h1>
          <p className="admin-page-subtitle">Xem thông tin và thống kê chi tiết của giảng viên</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="admin-search-input" placeholder="Tìm kiếm theo tên, email, SĐT..." value={keyword} onChange={handleSearch} />
        </div>
        <div className="admin-filters">
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
          ) : teachers.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              <p>Không tìm thấy giảng viên nào</p>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                  <th>Tình trạng</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-list-avatar">
                           {teacher.avatar ? (
                             <img src={teacher.avatar} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                           ) : (
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                           )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{teacher.fullName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{teacher.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{teacher.phoneNumber || '—'}</td>
                    <td><Badge map={STATUS_MAP} value={teacher.active} /></td>
                    <td>
                        {teacher.isLocked ? (
                            <span className="badge badge-danger">Đã khóa</span>
                        ) : (
                            <span className="badge badge-success">Bình thường</span>
                        )}
                    </td>
                    <td>{fmtDate(teacher.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn view" onClick={() => openModal(teacher)} title="Xem chi tiết & Thống kê">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
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
          <div className="admin-toolbar-info">Tổng: <strong>{totalElements}</strong> giảng viên</div>
          <Pagination />
        </div>
      </div>

      {modal.type === 'detail' && modal.data && <DetailModal teacher={modal.data} stats={modal.stats} />}
    </div>
  );
};

export default AdminTeachers;
