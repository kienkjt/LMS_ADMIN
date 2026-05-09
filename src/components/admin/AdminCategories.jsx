import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { adminCategoryService } from '../../services/adminService';
import './Admin.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search debounce
  const [searchTimeout, setSearchTimeout] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminCategoryService.getAll({
        keyword,
        page: currentPage,
        pageSize,
      });
      setCategories(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, [keyword, currentPage, pageSize]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setKeyword(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(setTimeout(() => {
      setCurrentPage(1);
    }, 500));
  };

  // Modal handlers
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setEditingCategory(null);
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setFormData({ name: category.name, description: category.description || '' });
    setFormErrors({});
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '' });
    setFormErrors({});
    setEditingCategory(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Tên danh mục không được để trống';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (modalMode === 'create') {
        await adminCategoryService.create(formData);
        toast.success('Tạo danh mục thành công!');
      } else {
        await adminCategoryService.update(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công!');
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Đã xảy ra lỗi';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handlers
  const openDeleteConfirm = (category) => {
    setDeletingCategory(category);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    setDeletingCategory(null);
    setShowDeleteConfirm(false);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      await adminCategoryService.delete(deletingCategory.id);
      toast.success('Xóa danh mục thành công!');
      closeDeleteConfirm();
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể xóa danh mục. Có thể danh mục đang có khóa học.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý danh mục</h1>
          <p className="admin-page-subtitle">Tạo, chỉnh sửa và xóa danh mục khóa học</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal} id="btn-create-category">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tạo danh mục
        </button>
      </div>

      {/* Search */}
      <div className="admin-toolbar">
        <div className="admin-search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={keyword}
            onChange={handleSearchChange}
            className="admin-search-input"
            id="input-search-category"
          />
        </div>
        <div className="admin-toolbar-info">
          Tổng: <strong>{totalElements}</strong> danh mục
        </div>
      </div>

      {/* Table */}
      <div className="admin-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading-inline">
              <div className="spinner spinner-sm"></div>
              <span>Đang tải...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="admin-empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              <p>Không tìm thấy danh mục nào</p>
              <button className="btn btn-primary btn-sm" onClick={openCreateModal}>
                Tạo danh mục đầu tiên
              </button>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên danh mục</th>
                  <th>Mô tả</th>
                  <th>Ngày tạo</th>
                  <th>Cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat.id}>
                    <td className="text-center">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="admin-category-name">{cat.name}</div>
                    </td>
                    <td>
                      <div className="admin-cell-desc">{cat.description || '—'}</div>
                    </td>
                    <td>{formatDate(cat.createdAt)}</td>
                    <td>{formatDate(cat.updatedAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-action-btn edit"
                          onClick={() => openEditModal(cat)}
                          title="Chỉnh sửa"
                          id={`btn-edit-cat-${cat.id}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => openDeleteConfirm(cat)}
                          title="Xóa"
                          id={`btn-delete-cat-${cat.id}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modalMode === 'create' ? 'Tạo danh mục mới' : 'Chỉnh sửa danh mục'}</h3>
              <button className="admin-modal-close" onClick={closeModal}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Tên danh mục <span>*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input ${formErrors.name ? 'error' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Web Development"
                    id="input-category-name"
                    autoFocus
                  />
                  {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả về danh mục..."
                    rows={4}
                    id="input-category-desc"
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} id="btn-submit-category">
                  {submitting ? (
                    <>
                      <div className="spinner spinner-sm"></div>
                      Đang lưu...
                    </>
                  ) : modalMode === 'create' ? 'Tạo danh mục' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="admin-modal-overlay" onClick={closeDeleteConfirm}>
          <div className="admin-modal admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Xác nhận xóa</h3>
              <button className="admin-modal-close" onClick={closeDeleteConfirm}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-confirm-content">
                <div className="admin-confirm-icon danger">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <p>Bạn có chắc chắn muốn xóa danh mục <strong>"{deletingCategory?.name}"</strong>?</p>
                <p className="text-sm text-muted">Hành động này không thể hoàn tác. Danh mục đang có khóa học sẽ không thể xóa.</p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="btn btn-ghost" onClick={closeDeleteConfirm}>
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                id="btn-confirm-delete"
              >
                {deleting ? (
                  <>
                    <div className="spinner spinner-sm"></div>
                    Đang xóa...
                  </>
                ) : 'Xóa danh mục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
