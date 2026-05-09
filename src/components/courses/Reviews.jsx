import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { reviewService } from "../../services/reviewService";
import { FaStar, FaTrash, FaEdit, FaPaperPlane } from "react-icons/fa";
import "./Reviews.css";

const ReviewForm = ({
  courseId,
  onSubmit,
  initialData = null,
  onCancel = null,
}) => {
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn cần đăng nhập để bình luận");
      return;
    }
    if (rating === 0) {
      toast.error("Vui lòng chọn đánh giá sao");
      return;
    }
    if (comment.trim().length === 0) {
      toast.error("Vui lòng nhập bình luận");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ rating, comment });
      setRating(5);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Đánh giá của bạn:</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (hoveredRating || rating) ? "active" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              title={`${star} sao`}
            >
              <FaStar />
            </button>
          ))}
        </div>
        <span className="rating-text">{rating > 0 && `${rating} sao`}</span>
      </div>

      <div className="form-group">
        <label htmlFor="comment">Bình luận:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
          rows={4}
          maxLength={2000}
        />
        <span className="char-count">{comment.length}/2000</span>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner"></span> Đang gửi...
            </>
          ) : (
            <>
              <FaPaperPlane /> Gửi bình luận
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const ReviewCard = ({ review, isOwn, onDelete, onEdit }) => {
  return (
    <div className="review-card">
      {/* Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.studentName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">
              {review.studentName || "Anonymous"}
            </h4>
            <div className="review-meta">
              <div className="rating-display">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < review.rating ? "filled" : ""}
                    size={12}
                  />
                ))}
              </div>
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {isOwn && (
          <div className="review-actions">
            <button className="btn-icon" onClick={onEdit} title="Chỉnh sửa">
              <FaEdit />
            </button>
            <button className="btn-icon delete" onClick={onDelete} title="Xóa">
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* Comment */}
      <div className="review-comment">
        <p>{review.comment}</p>
      </div>
    </div>
  );
};

const Reviews = ({ courseId }) => {
  const { user } = useSelector((state) => state.auth);
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState(null);

  // Load reviews
  useEffect(() => {
    loadReviews();
  }, [courseId, page]);

  const loadReviews = async () => {
    try {
      setLoading(true);

      // Load my review if authenticated
      if (user) {
        try {
          const myRes = await reviewService.getMyReview(courseId);
          setMyReview(myRes.data);
        } catch {
          // No review yet
        }
      }

      // Load all reviews
      const res = await reviewService.getByCourse(courseId, { page, size: 10 });
      const data = res.data;
      const reviewsList = Array.isArray(data) ? data : data?.content || [];
      const total = data?.totalElements || reviewsList.length;

      if (page === 1) {
        setReviews(reviewsList);
      } else {
        setReviews((prev) => [...prev, ...reviewsList]);
      }

      setHasMore(reviews.length + reviewsList.length < total);

      // Load rating stats
      try {
        const statsRes = await reviewService.getRatingStats(courseId);
        setStats(statsRes.data);
      } catch {
        // Stats not available
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Lỗi tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = async (data) => {
    try {
      await reviewService.create({
        courseId,
        rating: data.rating,
        comment: data.comment,
      });
      toast.success("Bình luận đã được gửi");
      setShowForm(false);
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error("Lỗi khi gửi bình luận");
    }
  };

  const handleUpdateReview = async (data) => {
    try {
      await reviewService.update(editingReview.id, {
        rating: data.rating,
        comment: data.comment,
      });
      toast.success("Bình luận đã được cập nhật");
      setEditingReview(null);
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error("Lỗi khi cập nhật bình luận");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;

    try {
      await reviewService.delete(reviewId);
      toast.success("Bình luận đã được xóa");
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error("Lỗi khi xóa bình luận");
    }
  };

  return (
    <div className="reviews-section">
      <h2>Bình luận & Đánh giá</h2>

      {/* Rating Summary */}
      {stats && (
        <div className="rating-summary">
          <div className="rating-average">
            <div className="average-score">
              <span className="score">{stats.avgRating?.toFixed(1)}</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(stats.avgRating) ? "filled" : ""}
                  />
                ))}
              </div>
              <span className="review-count">
                ({stats.totalReviews} bình luận)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My Review Form */}
      {user && !myReview && !editingReview && (
        <>
          {!showForm ? (
            <button
              className="btn btn-primary btn-new-review"
              onClick={() => setShowForm(true)}
            >
              Viết bình luận
            </button>
          ) : (
            <ReviewForm
              courseId={courseId}
              onSubmit={handleCreateReview}
              onCancel={() => setShowForm(false)}
            />
          )}
        </>
      )}

      {/* Editing Review */}
      {editingReview && (
        <ReviewForm
          courseId={courseId}
          initialData={editingReview}
          onSubmit={handleUpdateReview}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {myReview && (
          <div className="my-review-section">
            <h3>Bình luận của bạn</h3>
            <ReviewCard
              review={myReview}
              isOwn={true}
              onDelete={() => handleDeleteReview(myReview.id)}
              onEdit={() => setEditingReview(myReview)}
            />
          </div>
        )}

        <div className="other-reviews">
          {reviews
            .filter((r) => !myReview || r.id !== myReview.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={review.studentId === user?.id}
                onDelete={() => handleDeleteReview(review.id)}
                onEdit={() => setEditingReview(review)}
              />
            ))}
        </div>

        {loading && <div className="loading">Đang tải bình luận...</div>}

        {hasMore && (
          <button
            className="btn btn-outline btn-load-more"
            onClick={() => setPage((p) => p + 1)}
          >
            Xem thêm bình luận
          </button>
        )}

        {!loading && reviews.length === 0 && !myReview && (
          <div className="empty-reviews">
            <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;

// Export sub-components for testing
export { ReviewForm, ReviewCard };
