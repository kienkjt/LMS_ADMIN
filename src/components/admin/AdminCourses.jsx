import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminCourseService } from '../../services/adminService';
import { adminCategoryService } from '../../services/adminService';
import './Admin.css';

const STATUS_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
  { value: 'APPROVED', label: 'Đã duyệt' },
  { value: 'REJECTED', label: 'Đã từ chối' },
  { value: 'DRAFT', label: 'Bản nháp' },
  { value: 'PUBLISHED', label: 'Đã xuất bản' },
];

const LEVEL_OPTIONS = [
  { value: '', label: 'Tất cả cấp độ' },
  { value: 'BEGINNER', label: 'Người mới' },
  { value: 'INTERMEDIATE', label: 'Trung cấp' },
  { value: 'ADVANCED', label: 'Nâng cao' },
];

const getStatusBadge = (status) => {
  const map = {
    PENDING_REVIEW: { class: 'badge-warning', label: 'Chờ duyệt' },
    APPROVED: { class: 'badge-success', label: 'Đã duyệt' },
    REJECTED: { class: 'badge-error', label: 'Đã từ chối' },
    DRAFT: { class: 'badge-gray', label: 'Bản nháp' },
    PUBLISHED: { class: 'badge-primary', label: 'Đã xuất bản' },
    ARCHIVED: { class: 'badge-gray', label: 'Đã lưu trữ' },
  };
  const info = map[status] || { class: 'badge-gray', label: status };
  return <span className={`badge ${info.class}`}>{info.label}</span>;
};

const getLevelLabel = (level) => {
  const map = { BEGINNER: 'Người mới', INTERMEDIATE: 'Trung cấp', ADVANCED: 'Nâng cao' };
  return map[level] || level;
};

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    level: '',
    categoryId: '',
  });

  // Reject modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingCourse, setRejectingCourse] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  // Course detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Students modal
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [studentsCourse, setStudentsCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsPage, setStudentsPage] = useState(0);
  const [studentsTotalPages, setStudentsTotalPages] = useState(0);
  const [studentsTotalElements, setStudentsTotalElements] = useState(0);

  // Search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await adminCategoryService.getAll({ page: 1, pageSize: 100 });
      setCategories(res.data.content || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminCourseService.searchManagedCourses(filters, {
        page: currentPage,
        pageSize,
      });
      setCourses(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      handleFilterChange('keyword', value);
    }, 500));
  };

  // Course actions
  const handleApprove = async (course) => {
    setActionLoading(course.id);
    try {
      await adminCourseService.approve(course.id);
      toast.success(`Đã phê duyệt khóa học "${course.title}"`);
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể phê duyệt khóa học');
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (course) => {
    setRejectingCourse(course);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    setActionLoading(rejectingCourse.id);
    try {
      await adminCourseService.reject(rejectingCourse.id, rejectReason);
      toast.success(`Đã từ chối khóa học "${rejectingCourse.title}"`);
      setShowRejectModal(false);
      setRejectingCourse(null);
      setRejectReason('');
      fetchCourses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể từ chối khóa học');
    } finally {
      setActionLoading(null);
    }
  };

  const openDetailModal = (course) => {
    setSelectedCourse(course);
    setShowDetailModal(true);
  };

  // Students
  const openStudentsModal = async (course, page = 0) => {
    setStudentsCourse(course);
    setShowStudentsModal(true);
    setStudentsPage(page);
    setStudentsLoading(true);
    try {
      const res = await adminCourseService.getStudentsByCourse(course.id, { page, size: 10 });
      setStudents(res.data.content);
      setStudentsTotalPages(res.data.totalPages);
      setStudentsTotalElements(res.data.totalElements);
    } catch (e) {
      toast.error('Không thể tải danh sách học viên');
    } finally {
      setStudentsLoading(false);
    }
  };

  const closeStudentsModal = () => {
    setShowStudentsModal(false);
    setStudentsCourse(null);
    setStudents([]);
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý khóa học</h1>
          <p className="admin-page-subtitle">Phê duyệt, từ chối và quản lý tất cả khóa học</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm khóa học..."
            onChange={handleSearchChange}
            className="admin-search-input"
            id="input-search-course"
          />
        </div>
        <div className="admin-filters">
          <select
            className="admin-filter-select"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            id="select-status-filter"
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="admin-filter-select"
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            id="select-level-filter"
          >
            {LEVEL_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            className="admin-filter-select"
            value={filters.categoryId}
            onChange={(e) => handleFilterChange('categoryId', e.target.value)}
            id="select-category-filter"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-toolbar-info" style={{ marginBottom: '16px' }}>
        Tìm thấy <strong>{totalElements}</strong> khóa học
      </div>

      {/* Course Cards */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading-inline">
              <div className="spinner spinner-sm"></div>
              <span>Đang tải...</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p>Không tìm thấy khóa học nào</p>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Cấp độ</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Học viên</th>
                  <th>Đánh giá</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="admin-course-cell">
                        <div className="admin-course-thumb">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} />
                          ) : (
                            <div className="thumb-placeholder">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div
                            className="admin-course-title clickable"
                            onClick={() => openDetailModal(course)}
                          >
                            {course.title}
                          </div>
                          <div className="admin-course-desc">{course.description?.substring(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{getLevelLabel(course.level)}</span>
                    </td>
                    <td className="text-bold">{formatPrice(course.price)}</td>
                    <td>{getStatusBadge(course.status)}</td>
                    <td className="text-center">{course.studentCount || 0}</td>
                    <td>
                      <div className="admin-rating">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        <span>{course.avgRating ? course.avgRating.toFixed(1) : '0.0'}</span>
                      </div>
                    </td>
                    <td>{formatDate(course.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn view"
                          onClick={() => openDetailModal(course)}
                          title="Xem chi tiết"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          className="admin-action-btn edit"
                          onClick={() => openStudentsModal(course)}
                          title="Xem học viên"
                          id={`btn-students-${course.id}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                        </button>
                        {course.status === 'PENDING_REVIEW' && (
                          <>
                            <button
                              className="admin-action-btn approve"
                              onClick={() => handleApprove(course)}
                              disabled={actionLoading === course.id}
                              title="Phê duyệt"
                              id={`btn-approve-${course.id}`}
                            >
                              {actionLoading === course.id ? (
                                <div className="spinner spinner-sm"></div>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                            <button
                              className="admin-action-btn reject"
                              onClick={() => openRejectModal(course)}
                              title="Từ chối"
                              id={`btn-reject-${course.id}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button
              className="admin-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              ← Trước
            </button>
            <div className="admin-page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, idx, arr) => (
                  <React.Fragment key={page}>
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="admin-page-ellipsis">...</span>
                    )}
                    <button
                      className={`admin-page-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              className="admin-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && rejectingCourse && (
        <div className="admin-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Từ chối khóa học</h3>
              <button className="admin-modal-close" onClick={() => setShowRejectModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-reject-info">
                <p>Bạn sắp từ chối khóa học: <strong>"{rejectingCourse.title}"</strong></p>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Lý do từ chối <span>*</span>
                </label>
                <textarea
                  className="form-textarea"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối khóa học..."
                  rows={4}
                  id="input-reject-reason"
                  autoFocus
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowRejectModal(false)}>
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
                id="btn-confirm-reject"
              >
                {actionLoading ? (
                  <>
                    <div className="spinner spinner-sm"></div>
                    Đang xử lý...
                  </>
                ) : 'Từ chối khóa học'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {showDetailModal && selectedCourse && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Chi tiết khóa học</h3>
              <button className="admin-modal-close" onClick={() => setShowDetailModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-course-detail">
                {selectedCourse.thumbnail && (
                  <div className="admin-detail-thumb">
                    <img src={selectedCourse.thumbnail} alt={selectedCourse.title} />
                  </div>
                )}
                <div className="admin-detail-grid">
                  <div className="admin-detail-item">
                    <label>Tên khóa học</label>
                    <p>{selectedCourse.title}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Trạng thái</label>
                    <p>{getStatusBadge(selectedCourse.status)}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Cấp độ</label>
                    <p>{getLevelLabel(selectedCourse.level)}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Giá</label>
                    <p className="text-bold">{formatPrice(selectedCourse.price)}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Thời lượng</label>
                    <p>{selectedCourse.duration ? `${selectedCourse.duration} phút` : 'Chưa cập nhật'}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Số học viên</label>
                    <p>{selectedCourse.studentCount || 0}</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Đánh giá TB</label>
                    <p>{selectedCourse.avgRating ? selectedCourse.avgRating.toFixed(1) : '0.0'} ⭐</p>
                  </div>
                  <div className="admin-detail-item">
                    <label>Ngày tạo</label>
                    <p>{formatDate(selectedCourse.createdAt)}</p>
                  </div>
                </div>
                <div className="admin-detail-item full">
                  <label>Mô tả</label>
                  <p>{selectedCourse.description || 'Chưa có mô tả'}</p>
                </div>
                {selectedCourse.rejectionReason && (
                  <div className="admin-detail-item full">
                    <label className="text-danger">Lý do từ chối</label>
                    <p className="admin-rejection-reason">{selectedCourse.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
              {selectedCourse.status === 'PENDING_REVIEW' && (
                <>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedCourse);
                    }}
                  >
                    Từ chối
                  </button>
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleApprove(selectedCourse);
                    }}
                  >
                    Phê duyệt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {showStudentsModal && studentsCourse && (
        <div className="admin-modal-overlay" onClick={closeStudentsModal}>
          <div className="admin-modal admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Học viên - {studentsCourse.title}</h3>
              <button className="admin-modal-close" onClick={closeStudentsModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-toolbar-info" style={{ marginBottom: '12px' }}>
                Tổng: <strong>{studentsTotalElements}</strong> học viên
              </div>

              {studentsLoading ? (
                <div className="admin-loading-inline">
                  <div className="spinner spinner-sm"></div>
                  <span>Đang tải...</span>
                </div>
              ) : students.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '40px 20px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                  <p>Chưa có học viên nào đăng ký</p>
                </div>
              ) : (
                <div className="admin-students-list">
                  <table className="data-table admin-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Học viên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Tiến độ</th>
                        <th>Ngày đăng ký</th>
                        <th>Hoàn thành</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.enrollmentId}>
                          <td>
                            <div className="admin-user-cell">
                              <div className="admin-list-avatar" style={{ width: 30, height: 30 }}>
                                {s.studentAvatar ? (
                                  <img src={s.studentAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                  </svg>
                                )}
                              </div>
                              <span>{s.studentName || '—'}</span>
                            </div>
                          </td>
                          <td>{s.studentEmail}</td>
                          <td>{s.studentPhoneNumber || '—'}</td>
                          <td>
                            <div className="admin-progress-cell">
                              <div className="admin-progress-bar">
                                <div className="admin-progress-fill" style={{ width: `${s.progressPercent || 0}%` }}></div>
                              </div>
                              <span>{s.progressPercent != null ? `${Number(s.progressPercent).toFixed(0)}%` : '0%'}</span>
                            </div>
                          </td>
                          <td>{formatDateTime(s.enrolledAt)}</td>
                          <td>
                            {s.completedAt ? (
                              <span className="badge badge-success">Hoàn thành</span>
                            ) : (
                              <span className="badge badge-gray">Đang học</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Students Pagination */}
                  {studentsTotalPages > 1 && (
                    <div className="admin-pagination" style={{ borderTop: 'none', paddingTop: '12px' }}>
                      <button className="admin-page-btn" disabled={studentsPage === 0}
                        onClick={() => openStudentsModal(studentsCourse, studentsPage - 1)}>← Trước</button>
                      <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                        Trang {studentsPage + 1} / {studentsTotalPages}
                      </span>
                      <button className="admin-page-btn" disabled={studentsPage >= studentsTotalPages - 1}
                        onClick={() => openStudentsModal(studentsCourse, studentsPage + 1)}>Sau →</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="btn btn-ghost" onClick={closeStudentsModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
