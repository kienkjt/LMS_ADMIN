import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { addToCart } from "../../store/cartSlice";
import { cartService } from "../../services/cartService";
import { wishlistService } from "../../services/wishlistService";
import {
  formatPrice,
  formatDuration,
  getStarArray,
  truncateText,
} from "../../utils/helpers";
import { ROUTES, COURSE_LEVELS } from "../../utils/constants";
import {
  FaBook,
  FaCheck,
  FaShoppingCart,
  FaUsers,
  FaFileAlt,
  FaClock,
  FaHeart,
} from "react-icons/fa";
import "./CourseCard.css";

const levelLabel = {
  BEGINNER: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
};
const levelClass = {
  BEGINNER: "badge-success",
  INTERMEDIATE: "badge-warning",
  ADVANCED: "badge-error",
};

const CourseCard = ({ course, onWishlistChange }) => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  
  const inCart = items.some((i) => i.courseId === course.id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để thêm vào giỏ hàng");
      return;
    }
    if (inCart) {
      toast.info("Khóa học đã có trong giỏ hàng");
      return;
    }
    try {
      await cartService.addItem(course.id);
      dispatch(addToCart({ courseId: course.id, course }));
      toast.success("Đã thêm vào giỏ hàng!");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.info("Vui lòng đăng nhập để lưu khóa học yêu thích");
      return;
    }

    try {
      setLoadingWishlist(true);
      if (inWishlist) {
        await wishlistService.remove(course.id);
        setInWishlist(false);
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } else {
        await wishlistService.add(course.id);
        setInWishlist(true);
        toast.success("Đã lưu vào danh sách yêu thích");
      }
      if (onWishlistChange) {
        onWishlistChange(course.id, !inWishlist);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                       (inWishlist ? "Không thể xóa" : "Không thể thêm vào danh sách yêu thích");
      toast.error(errorMsg);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const stars = getStarArray(course.avgRating || 0);

  return (
    <Link
      to={`/courses/${course.slug || course.id}`}
      className="course-card"
      id={`course-card-${course.id}`}
    >
      {/* Thumbnail */}
      <div className="course-thumbnail">
        {course.thumbnail ? (
          <img src={course.thumbnail} alt={course.title} loading="lazy" />
        ) : (
          <div className="course-thumbnail-placeholder">
            <FaBook size={32} />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlistToggle}
          disabled={loadingWishlist}
          title={inWishlist ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
          id={`wishlist-btn-${course.id}`}
        >
          <FaHeart size={20} />
        </button>

        {/* Overlay */}
        <div className="course-overlay">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            id={`add-to-cart-${course.id}`}
          >
            {inCart ? (
              <>
                <FaCheck style={{ marginRight: "6px" }} /> Trong giỏ hàng
              </>
            ) : (
              <>
                <FaShoppingCart style={{ marginRight: "6px" }} /> Thêm vào giỏ
              </>
            )}
          </button>
        </div>

        {/* Badge */}
        {course.discountPrice && course.discountPrice < course.price && (
          <span className="course-discount-badge">
            -{Math.round((1 - course.discountPrice / course.price) * 100)}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="course-info">
        {/* Category + Level */}
        <div className="course-meta">
          {course.level && (
            <span className={`badge ${levelClass[course.level]}`}>
              {levelLabel[course.level]}
            </span>
          )}
          {course.categoryName && (
            <span className="badge badge-gray">{course.categoryName}</span>
          )}
        </div>

        {/* Title */}
        <h3 className="course-title">{truncateText(course.title, 65)}</h3>

        {/* Description */}
        <p className="course-desc">
          {truncateText(course.shortDescription, 80)}
        </p>

        {/* Instructor */}
        {course.instructorName && (
          <p className="course-instructor">
            <FaFileAlt style={{ marginRight: "6px" }} /> {course.instructorName}
          </p>
        )}

        {/* Rating */}
        <div className="course-rating">
          <span className="rating-value">
            {(course.avgRating || 0).toFixed(1)}
          </span>
          <div className="stars">
            {stars.map((s, i) => (
              <span key={i} className={`star star-${s}`}>
                ★
              </span>
            ))}
          </div>
          <span className="rating-count">({course.totalReviews || 0})</span>
        </div>

        {/* Stats */}
        <div className="course-stats">
          <span>
            <FaUsers style={{ marginRight: "6px" }} />{" "}
            {course.totalStudents || 0}
          </span>
          {course.totalLessons && (
            <span>
              <FaFileAlt style={{ marginRight: "6px" }} /> {course.totalLessons}{" "}
              bài
            </span>
          )}
          {course.totalDuration && (
            <span>
              <FaClock style={{ marginRight: "6px" }} />{" "}
              {formatDuration(course.totalDuration)}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="course-price">
          {course.discountPrice && course.discountPrice < course.price ? (
            <>
              <span className="price-current">
                {formatPrice(course.discountPrice)}
              </span>
              <span className="price-original">
                {formatPrice(course.price)}
              </span>
            </>
          ) : (
            <span className="price-current">{formatPrice(course.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
