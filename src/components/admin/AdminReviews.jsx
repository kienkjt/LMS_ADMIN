import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminReviewService } from '../../services/adminService';
import './Admin.css';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminReviewService.getAll({ page, size });
      setReviews(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Xóa đánh giá vi phạm này?')) {
      return;
    }

    setDeletingId(review.id);
    try {
      await adminReviewService.delete(review.id);
      toast.success('Đã xóa đánh giá');

      if (reviews.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        fetchReviews();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xóa đánh giá');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản lý đánh giá</h1>
          <p className="admin-page-subtitle">Xóa các đánh giá vi phạm trên hệ thống</p>
        </div>
      </div>

      <div className="admin-toolbar-info" style={{ marginBottom: '16px' }}>
        Tổng: <strong>{totalElements}</strong> đánh giá
      </div>

      <div className="admin-card">
        <div className="admin-table-wrapper">
          {loading ? (
            <div className="admin-loading-inline">
              <div className="spinner spinner-sm"></div>
              <span>Đang tải...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="admin-empty-state">
              <p>Không có đánh giá nào</p>
            </div>
          ) : (
            <table className="data-table admin-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Sao</th>
                  <th>Nội dung</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{review.studentName || 'Unknown'}</div>
                    </td>
                    <td style={{ maxWidth: 260, wordBreak: 'break-word' }}>{review.courseId || '—'}</td>
                    <td>{review.rating || 0}/5</td>
                    <td style={{ maxWidth: 360, wordBreak: 'break-word' }}>{review.comment || '—'}</td>
                    <td>{formatDateTime(review.createdAt)}</td>
                    <td>
                      <button
                        className="admin-action-btn reject"
                        onClick={() => handleDeleteReview(review)}
                        disabled={deletingId === review.id}
                        title="Xóa đánh giá vi phạm"
                      >
                        {deletingId === review.id ? '...' : 'Xóa'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="admin-page-btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              ← Trước
            </button>
            <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
              Trang {page + 1} / {totalPages}
            </span>
            <button className="admin-page-btn" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
              Sau →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
