import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBullseye,
  FaCalendar,
  FaCheck,
  FaClipboard,
  FaClock,
  FaFileAlt,
  FaGlobe,
  FaGraduationCap,
  FaHeart,
  FaInfinity,
  FaLock,
  FaMobileAlt,
  FaPlay,
  FaShoppingCart,
  FaStar,
  FaThumbtack,
  FaTrophy,
  FaUser,
  FaUsers,
  FaVideo,
} from "react-icons/fa";
import Loading from "../components/common/Loading";
import { addToCart } from "../store/cartSlice";
import { chapterService } from "../services/chapterService";
import { cartService } from "../services/cartService";
import { enrollmentService } from "../services/enrollmentService";
import { lessonService } from "../services/lessonService";
import { reviewService } from "../services/reviewService";
import { wishlistService } from "../services/wishlistService";
import api from "../services/api";
import { ROUTES, ROLES } from "../utils/constants";
import {
  formatDate,
  formatDuration,
  formatNumber,
  formatPrice,
  getStarArray,
} from "../utils/helpers";
import "./CourseDetailPage.css";

const normalizeCourse = (course) => {
  if (!course) return null;

  return {
    ...course,
    thumbnail: course.thumbnail || course.image || "",
    shortDescription: course.shortDescription || course.description || "",
    fullDescription: course.fullDescription || course.description || "",
    instructorName:
      course.instructorName ||
      course.instructor?.fullName ||
      course.instructor?.name ||
      "",
    avgRating: course.avgRating ?? course.rating ?? 0,
    totalReviews: course.totalReviews ?? course.reviews ?? 0,
    totalStudents: course.totalStudents ?? course.students ?? 0,
    totalLessons: course.totalLessons ?? course.lessons ?? 0,
    totalDuration: course.totalDuration ?? 0,
  };
};

const isPreviewLesson = (lesson) =>
  Boolean(lesson?.freePreview ?? lesson?.isFreePreview);

const extractYouTubeId = (url) => {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }

  return null;
};

const getPreviewLesson = (chapters) => {
  const lessons = chapters.flatMap((chapter) => chapter.lessons || []);

  return (
    lessons.find(
      (lesson) =>
        lesson.type === "VIDEO" && lesson.videoUrl && isPreviewLesson(lesson),
    ) || null
  );
};

const CourseDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [activeTab, setActiveTab] = useState("curriculum");
  const [previewLesson, setPreviewLesson] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const inCart = items.some((item) => item.courseId === course?.id);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);

        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            slug,
          );
        const isNumericId = /^\d+$/.test(slug);

        let courseResponse;

        if (isUUID || isNumericId) {
          courseResponse = await api.get(`/v1/courses/${slug}`);
        } else {
          try {
            courseResponse = await api.get(`/v1/courses/slug/${slug}`);
          } catch {
            courseResponse = await api.get(`/v1/courses/${slug}`);
          }
        }

        const normalizedCourse = normalizeCourse(
          courseResponse.data?.data || courseResponse.data,
        );
        setCourse(normalizedCourse);

        const chaptersRes = await chapterService.getChaptersByCourse(
          normalizedCourse.id,
        );
        const chapterList = Array.isArray(chaptersRes.data)
          ? chaptersRes.data
          : [];

        const chaptersWithLessons = await Promise.all(
          chapterList.map(async (chapter) => {
            if (Array.isArray(chapter.lessons) && chapter.lessons.length > 0) {
              return chapter;
            }

            try {
              const lessonsRes = await lessonService.getLessonsByChapter(
                normalizedCourse.id,
                chapter.id,
              );
              return {
                ...chapter,
                lessons: Array.isArray(lessonsRes.data) ? lessonsRes.data : [],
              };
            } catch {
              return {
                ...chapter,
                lessons: Array.isArray(chapter.lessons) ? chapter.lessons : [],
              };
            }
          }),
        );

        setChapters(chaptersWithLessons);
        if (chaptersWithLessons.length > 0) {
          setExpandedChapter(chaptersWithLessons[0].id);
        }
        setPreviewLesson(getPreviewLesson(chaptersWithLessons));

        try {
          const reviewsRes = await reviewService.getByCourse(
            normalizedCourse.id,
            {
              page: 1,
              size: 20,
            },
          );
          const reviewData = reviewsRes.data?.content || reviewsRes.data || [];
          setReviews(Array.isArray(reviewData) ? reviewData : []);
        } catch (reviewError) {
          console.error("Failed to load reviews:", reviewError);
          setReviews([]);
        }

        if (isAuthenticated && user?.role === ROLES.STUDENT) {
          try {
            const enrollmentRes = await enrollmentService.getEnrollment(
              normalizedCourse.id,
            );
            setEnrollment(enrollmentRes.data);
          } catch {
            setEnrollment(null);
          }
        }
      } catch (error) {
        console.error("Failed to load course detail:", error);
        toast.error("Không tìm thấy khóa học");
        navigate(ROUTES.COURSES);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourseDetail();
    }
  }, [slug, isAuthenticated, user?.role, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (inCart) {
      navigate(ROUTES.CART);
      return;
    }

    try {
      await cartService.addItem(course.id);
      dispatch(addToCart({ courseId: course.id, course }));
      toast.success("Đã thêm vào giỏ hàng!");
    } catch (error) {
      console.error("Add to cart failed:", error);
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    setEnrollLoading(true);
    try {
      await enrollmentService.enroll(course.id);
      setEnrollment({ enrolled: true, progressPercent: 0 });
      toast.success("Đăng ký khóa học thành công!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể đăng ký khóa học",
      );
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
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
    } catch (error) {
      const errorMsg = error.response?.data?.message || 
                       (inWishlist ? "Không thể xóa" : "Không thể thêm vào danh sách yêu thích");
      toast.error(errorMsg);
    } finally {
      setLoadingWishlist(false);
    }
  };

  if (loading) return <Loading fullPage />;
  if (!course) return null;

  const stars = getStarArray(course.avgRating || 0);
  const isFree = !course.price || course.price === 0;
  const finalPrice = course.discountPrice || course.price;
  const previewYouTubeId = extractYouTubeId(previewLesson?.videoUrl);
  const chapterCount = chapters.length;
  const lessonCountFromChapters = chapters.reduce(
    (totalLessons, chapter) => totalLessons + (chapter.lessons?.length || 0),
    0,
  );
  const totalDurationFromChapters = chapters.reduce(
    (totalDuration, chapter) =>
      totalDuration +
      (chapter.lessons || []).reduce(
        (lessonDuration, lesson) => lessonDuration + (lesson.duration || 0),
        0,
      ),
    0,
  );
  const displayLessonCount =
    lessonCountFromChapters || course.totalLessons || 0;
  const displayDuration =
    totalDurationFromChapters || course.totalDuration || 0;
  const enrollmentProgress = Math.min(
    100,
    Math.max(0, enrollment?.progressPercent || 0),
  );

  return (
    <div className="course-detail-page">
      <div className="course-detail-hero">
        <div className="container">
          <div className="course-detail-header">
            <div className="course-detail-info">
              <p className="course-breadcrumb">Khóa học / Chi tiết khóa học</p>

              <div className="course-detail-badges">
                {course.level && (
                  <span
                    className={`badge ${
                      course.level === "BEGINNER"
                        ? "badge-success"
                        : course.level === "INTERMEDIATE"
                          ? "badge-warning"
                          : "badge-error"
                    }`}
                  >
                    {course.level === "BEGINNER" && "Cơ bản"}
                    {course.level === "INTERMEDIATE" && "Trung cấp"}
                    {course.level === "ADVANCED" && "Nâng cao"}
                  </span>
                )}

                {course.categoryName && (
                  <span className="badge badge-gray">
                    {course.categoryName}
                  </span>
                )}
              </div>

              <h1 className="course-detail-title">{course.title}</h1>
              <p className="course-detail-short-desc">
                {course.shortDescription}
              </p>

              <div className="detail-rating-row">
                <span className="detail-rating-value">
                  {(course.avgRating || 0).toFixed(1)}
                </span>
                <div className="stars">
                  {stars.map((star, index) => (
                    <span key={index} className={`star star-${star}`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="detail-rating-count">
                  ({formatNumber(course.totalReviews || 0)} đánh giá)
                </span>
              </div>

              <div className="course-quick-stats">
                <span className="quick-stat-pill">
                  <FaUsers /> {formatNumber(course.totalStudents || 0)} học viên
                </span>
                <span className="quick-stat-pill">
                  <FaClipboard /> {chapterCount} chương
                </span>
                <span className="quick-stat-pill">
                  <FaFileAlt /> {displayLessonCount} bài học
                </span>
                <span className="quick-stat-pill">
                  <FaClock /> {formatDuration(displayDuration)}
                </span>
              </div>

              <div className="course-instructor-line">
                {course.instructorName && (
                  <span>
                    <FaUser /> Giảng viên:{" "}
                    <strong>{course.instructorName}</strong>
                  </span>
                )}
                <span>
                  <FaCalendar /> Cập nhật: {formatDate(course.updatedAt)}
                </span>
                <span>
                  <FaGlobe /> {course.language || "Tiếng Việt"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-detail-layout">
          <div className="course-detail-main">
            <div className="tabs course-detail-tabs">
              {["overview", "curriculum", "reviews"].map((tabKey) => (
                <button
                  key={tabKey}
                  className={`tab ${activeTab === tabKey ? "active" : ""}`}
                  onClick={() => setActiveTab(tabKey)}
                >
                  {
                    {
                      overview: "Tổng quan",
                      curriculum: "Nội dung",
                      reviews: "Đánh giá",
                    }[tabKey]
                  }
                </button>
              ))}
            </div>

            {previewLesson && (
              <div className="card card-body mb-6 detail-preview-card">
                <h3 className="detail-section-title">
                  <FaPlay /> Video preview miễn phí
                </h3>
                <p className="detail-preview-title">{previewLesson.title}</p>

                <div className="detail-preview-player">
                  {previewYouTubeId ? (
                    <iframe
                      width="100%"
                      height="360"
                      src={`https://www.youtube.com/embed/${previewYouTubeId}`}
                      title={previewLesson.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <video controls width="100%" src={previewLesson.videoUrl}>
                      Trình duyệt của bạn không hỗ trợ phát video.
                    </video>
                  )}
                </div>
              </div>
            )}

            {activeTab === "overview" && (
              <div className="animate-fade-in">
                {course.whatYouWillLearn && (
                  <div className="card card-body mb-6 detail-section-card">
                    <h3 className="detail-section-title">
                      <FaBullseye /> Bạn sẽ học được
                    </h3>
                    <div className="learn-grid">
                      {(Array.isArray(course.whatYouWillLearn)
                        ? course.whatYouWillLearn
                        : String(course.whatYouWillLearn)
                            .split("\n")
                            .filter(Boolean)
                      ).map((item, index) => (
                        <div key={index} className="learn-item" role="listitem">
                          <FaCheck /> {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.fullDescription && (
                  <div className="card card-body mb-6 detail-section-card">
                    <h3 className="detail-section-title">
                      <FaClipboard /> Mô tả khóa học
                    </h3>
                    <p className="detail-description-text">
                      {course.fullDescription}
                    </p>
                  </div>
                )}

                {course.requirements && (
                  <div className="card card-body detail-section-card">
                    <h3 className="detail-section-title">
                      <FaThumbtack /> Yêu cầu trước khi học
                    </h3>
                    <ul className="detail-list" role="list">
                      {(Array.isArray(course.requirements)
                        ? course.requirements
                        : String(course.requirements)
                            .split("\n")
                            .filter(Boolean)
                      ).map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === "curriculum" && (
              <div className="animate-fade-in">
                <div className="curriculum-summary">
                  <span className="summary-pill">
                    <FaClipboard /> {chapterCount} chương
                  </span>
                  <span className="summary-pill">
                    <FaFileAlt /> {displayLessonCount} bài học
                  </span>
                  <span className="summary-pill">
                    <FaClock /> {formatDuration(displayDuration)}
                  </span>
                </div>

                {chapters.map((chapter) => (
                  <div key={chapter.id} className="chapter-item">
                    <button
                      className="chapter-header"
                      onClick={() =>
                        setExpandedChapter((prev) =>
                          prev === chapter.id ? null : chapter.id,
                        )
                      }
                    >
                      <span className="chapter-toggle">
                        {expandedChapter === chapter.id ? "▼" : "▶"}
                      </span>
                      <span className="chapter-title">{chapter.title}</span>
                      <span className="chapter-count">
                        {(chapter.lessons || []).length} bài
                      </span>
                    </button>

                    {expandedChapter === chapter.id && (
                      <div className="chapter-lessons">
                        {(chapter.lessons || []).map((lesson) => {
                          const canPreview = isPreviewLesson(lesson);

                          return (
                            <div key={lesson.id} className="lesson-item">
                              <span className="lesson-type-icon">
                                {canPreview ? <FaPlay /> : <FaLock />}
                              </span>
                              <span className="lesson-name">
                                {lesson.title}
                              </span>
                              {canPreview && (
                                <span className="badge badge-success">
                                  Xem thử
                                </span>
                              )}
                              <span className="lesson-duration">
                                {formatDuration(lesson.duration || 0)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}

                {chapters.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaFileAlt size={44} />
                    </div>
                    <h3>Nội dung đang được cập nhật</h3>
                    <p>
                      Giảng viên sẽ bổ sung chương và bài học sớm nhất có thể.
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="animate-fade-in">
                <div className="reviews-summary">
                  <div className="rating-big">
                    <span className="rating-num">
                      {(course.avgRating || 0).toFixed(1)}
                    </span>
                    <div className="stars" style={{ fontSize: "24px" }}>
                      {stars.map((star, index) => (
                        <span key={index} className={`star star-${star}`}>
                          <FaStar />
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">
                      ({formatNumber(course.totalReviews || 0)})
                    </span>
                  </div>
                </div>

                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="avatar avatar-sm">
                        {review.studentName?.[0] || "U"}
                      </div>
                      <div>
                        <div className="font-semibold">
                          {review.studentName || "Học viên"}
                        </div>
                        <div className="stars" style={{ fontSize: "14px" }}>
                          {getStarArray(review.rating || 0).map(
                            (star, index) => (
                              <span key={index} className={`star star-${star}`}>
                                ★
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                      <span className="text-muted text-sm">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <FaStar size={48} />
                    </div>
                    <h3>Chưa có đánh giá</h3>
                    <p>Hãy là người đầu tiên đánh giá khóa học này</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="course-purchase-card">
            <div className="course-detail-course-image-sidebar">
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} />
              ) : (
                <div className="course-image-placeholder-sidebar">
                  <FaGraduationCap />
                </div>
              )}
            </div>

            <div className="purchase-body">
              {previewLesson && (
                <div className="purchase-preview-note">
                  <FaPlay />
                  Có video preview miễn phí cho học viên chưa mua
                </div>
              )}

              <div className="purchase-price">
                {isFree ? (
                  <span className="detail-price-free">Miễn phí</span>
                ) : (
                  <>
                    <span className="detail-price-current">
                      {formatPrice(finalPrice)}
                    </span>
                    {course.discountPrice &&
                      course.price &&
                      course.discountPrice < course.price && (
                        <span className="detail-price-original">
                          {formatPrice(course.price)}
                        </span>
                      )}
                  </>
                )}
              </div>

              <div className="purchase-actions">
                <button
                  className={`btn-wishlist ${inWishlist ? 'active' : ''}`}
                  onClick={handleWishlistToggle}
                  disabled={loadingWishlist}
                  title={inWishlist ? 'Xóa khỏi yêu thích' : 'Lưu vào yêu thích'}
                  id="wishlist-detail-btn"
                >
                  <FaHeart /> {inWishlist ? 'Đã lưu' : 'Lưu'}
                </button>
              </div>

              <p className="purchase-subtitle">
                {enrollment
                  ? "Bạn đã đăng ký khóa học này"
                  : `${formatNumber(course.totalStudents || 0)} học viên đã đăng ký`}
              </p>

              {enrollment && (
                <div className="purchase-progress-block">
                  <div className="purchase-progress-head">
                    <span>Tiến độ học của bạn</span>
                    <strong>{enrollmentProgress}%</strong>
                  </div>
                  <div className="progress progress-lg">
                    <div
                      className="progress-bar"
                      style={{ width: `${enrollmentProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {enrollment ? (
                <Link
                  to={`/learn/${course.id}`}
                  className="btn btn-success btn-full btn-lg"
                >
                  <FaPlay /> Tiếp tục học
                </Link>
              ) : isFree ? (
                <button
                  className="btn btn-primary btn-full btn-lg"
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  id="enroll-btn"
                >
                  {enrollLoading ? (
                    <>
                      <span className="spinner spinner-sm"></span> Đang đăng
                      ký...
                    </>
                  ) : (
                    <>
                      <FaGraduationCap /> Đăng ký học miễn phí
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-primary btn-full btn-lg"
                    onClick={handleAddToCart}
                    id="add-to-cart-btn"
                  >
                    {inCart ? (
                      "→ Đến giỏ hàng"
                    ) : (
                      <>
                        <FaShoppingCart /> Thêm vào giỏ hàng
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-outline btn-full"
                    onClick={handleEnroll}
                    disabled={enrollLoading}
                  >
                    Mua ngay
                  </button>
                </>
              )}

              <div className="purchase-includes">
                <h4>Bao gồm:</h4>
                <div className="include-item">
                  <FaVideo /> Video HD chất lượng cao
                </div>
                <div className="include-item">
                  <FaFileAlt /> {displayLessonCount} bài học
                </div>
                <div className="include-item">
                  <FaClock /> {formatDuration(displayDuration)} nội dung
                </div>
                <div className="include-item">
                  <FaInfinity /> Truy cập trọn đời
                </div>
                <div className="include-item">
                  <FaMobileAlt /> Học trên mobile và tablet
                </div>
                <div className="include-item">
                  <FaTrophy /> Chứng chỉ hoàn thành
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
