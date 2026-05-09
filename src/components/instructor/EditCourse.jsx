import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import { categoryService } from "../../services/categoryService";
import { ROUTES } from "../../utils/constants";
import { toast } from "react-toastify";
import { FaBook, FaArrowLeft } from "react-icons/fa";
import "./CreateCourse.css";

// Backend enum values
const COURSE_LEVELS = {
  BEGINNER: "1",
  INTERMEDIATE: "2",
  ADVANCED: "3",
  ALL_LEVEL: "4",
};

const LEVEL_DISPLAY = {
  1: "Cơ bản",
  2: "Trung bình",
  3: "Nâng cao",
  4: "Tất cả cấp độ",
};

const EditCourse = () => {
  const { courseId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("basic");

  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    fullDescription: "",
    categoryId: "",
    level: COURSE_LEVELS.BEGINNER,
    price: 0,
    discountPrice: 0,
    totalDuration: 0,
    language: "Tiếng Việt",
    certificate: "",
    requirements: "",
    whatYouWillLearn: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [previewVideoFile, setPreviewVideoFile] = useState(null);
  const [currentThumbnail, setCurrentThumbnail] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await categoryService.getAll();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Fetch categories error:", error);
        toast.warning("Không thể tải danh mục khóa học");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setInitialLoading(true);
        const res = await courseService.getById(courseId);
        const course = res.data;

        setFormData({
          title: course.title || "",
          shortDescription: course.shortDescription || "",
          fullDescription: course.fullDescription || "",
          categoryId: course.categoryId || "",
          level: course.level || COURSE_LEVELS.BEGINNER,
          price: course.price || 0,
          discountPrice: course.discountPrice || 0,
          totalDuration: course.totalDuration || 0,
          language: course.language || "Tiếng Việt",
          certificate: course.certificate || "",
          requirements: course.requirements || "",
          whatYouWillLearn: course.whatYouWillLearn || "",
        });

        setCurrentThumbnail(course.thumbnail);
        setThumbnailPreview(course.thumbnail);
      } catch (error) {
        console.error("Fetch course error:", error);
        toast.error("Không thể tải thông tin khóa học");
        navigate(ROUTES.INSTRUCTOR_COURSES);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "discountPrice", "totalDuration"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Hình ảnh không được vượt quá 5MB");
        return;
      }
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        toast.error("Video không được vượt quá 500MB");
        return;
      }
      setPreviewVideoFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề khóa học");
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast.error("Vui lòng nhập mô tả ngắn");
      return;
    }
    if (!formData.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (Number(formData.discountPrice) > Number(formData.price)) {
      toast.error("Giá giảm không được lớn hơn giá gốc");
      return;
    }

    setLoading(true);
    try {
      const courseData = {
        title: formData.title,
        shortDescription: formData.shortDescription,
        fullDescription: formData.fullDescription || null,
        categoryId: formData.categoryId,
        level: formData.level,
        price: formData.price,
        discountPrice: formData.discountPrice || null,
        totalDuration: formData.totalDuration || null,
        language: formData.language,
        certificate: formData.certificate || null,
        requirements: formData.requirements || null,
        whatYouWillLearn: formData.whatYouWillLearn || null,
      };

      await courseService.update(courseId, courseData);
      toast.success("Cập nhật khóa học thành công!");

      // Upload thumbnail if provided
      if (thumbnailFile) {
        try {
          setUploadingMedia(true);
          await courseService.uploadCourseImage(courseId, thumbnailFile);
          toast.success("Tải lên hình ảnh khóa học thành công!");
        } catch (err) {
          toast.warning("Cập nhật thành công nhưng không thể tải lên hình ảnh");
          console.error("Thumbnail upload error:", err);
        }
      }

      // Upload preview video if provided
      if (previewVideoFile) {
        try {
          setUploadingMedia(true);
          await courseService.uploadCoursePreviewVideo(
            courseId,
            previewVideoFile,
          );
          toast.success("Tải lên video preview thành công!");
        } catch (err) {
          toast.warning(
            "Cập nhật thành công nhưng không thể tải lên video preview",
          );
          console.error("Preview video upload error:", err);
        }
      }

      setTimeout(() => {
        navigate(ROUTES.INSTRUCTOR_COURSES);
      }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể cập nhật khóa học");
    } finally {
      setLoading(false);
      setUploadingMedia(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="create-course-container">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <p>Đang tải thông tin khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-course-container">
      {/* Header */}
      <div className="create-course-header">
        <div>
          <h1>
            <FaArrowLeft
              style={{ cursor: "pointer", marginRight: "12px" }}
              onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
            />
            Sửa khóa học
          </h1>
          <p>Cập nhật thông tin chi tiết của khóa học</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="course-form-tabs">
        <button
          className={`tab-btn ${activeTab === "basic" ? "active" : ""}`}
          onClick={() => setActiveTab("basic")}
        >
          <FaBook /> Thông tin cơ bản
        </button>
        <button
          className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Nâng cao
        </button>
        <button
          className={`tab-btn ${activeTab === "media" ? "active" : ""}`}
          onClick={() => setActiveTab("media")}
        >
          Media & Hình ảnh
        </button>
      </div>

      {/* Form */}
      <div className="course-form-card">
        <form onSubmit={handleSubmit}>
          {/* TAB 1: BASIC */}
          {activeTab === "basic" && (
            <div className="form-section">
              <h2>Thông tin cơ bản</h2>

              <div className="form-group">
                <label htmlFor="title">
                  Tiêu đề khóa học <span className="required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="VD: React.js từ cơ bản đến nâng cao"
                  value={formData.title}
                  onChange={handleChange}
                  maxLength="200"
                  className="input"
                  required
                />
                <div className="char-count">
                  {formData.title.length} / 200 ký tự
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="categoryId">
                    Danh mục <span className="required">*</span>
                  </label>
                  {categoriesLoading ? (
                    <div className="input" style={{ color: "#999" }}>
                      Đang tải danh mục...
                    </div>
                  ) : (
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="input"
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {Array.isArray(categories) &&
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="level">
                    Mức độ <span className="required">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    {Object.entries(LEVEL_DISPLAY).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="shortDescription">
                  Mô tả ngắn <span className="required">*</span>
                  <span className="hint">(10-1000 ký tự)</span>
                </label>
                <textarea
                  id="shortDescription"
                  name="shortDescription"
                  placeholder="Mô tả ngắn gọn về khóa học..."
                  value={formData.shortDescription}
                  onChange={handleChange}
                  maxLength="1000"
                  className="input textarea"
                  rows="3"
                  required
                />
                <div className="char-count">
                  {formData.shortDescription.length} / 1000 ký tự
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className="btn btn-primary"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILS */}
          {activeTab === "details" && (
            <div className="form-section">
              <h2>Chi tiết khóa học</h2>

              <div className="form-group">
                <label htmlFor="fullDescription">
                  Mô tả đầy đủ
                  <span className="hint">(tối đa 5000 ký tự)</span>
                </label>
                <textarea
                  id="fullDescription"
                  name="fullDescription"
                  placeholder="Mô tả chi tiết về nội dung..."
                  value={formData.fullDescription}
                  onChange={handleChange}
                  maxLength="5000"
                  className="input textarea"
                  rows="5"
                />
                <div className="char-count">
                  {formData.fullDescription.length} / 5000 ký tự
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">
                    Giá bán (VND) <span className="required">*</span>
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.price}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="discountPrice">Giá giảm (VND)</label>
                  <input
                    id="discountPrice"
                    name="discountPrice"
                    type="number"
                    min="0"
                    step="10000"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalDuration">Tổng thời lượng (giờ)</label>
                  <input
                    id="totalDuration"
                    name="totalDuration"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.totalDuration}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="language">Ngôn ngữ</label>
                  <input
                    id="language"
                    name="language"
                    type="text"
                    maxLength="50"
                    value={formData.language}
                    onChange={handleChange}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="certificate">Chứng chỉ</label>
                  <input
                    id="certificate"
                    name="certificate"
                    type="text"
                    maxLength="100"
                    value={formData.certificate}
                    onChange={handleChange}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">Yêu cầu tiên quyết</label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    maxLength="2000"
                    value={formData.requirements}
                    onChange={handleChange}
                    className="input textarea"
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="whatYouWillLearn">Bạn sẽ học được gì</label>
                <textarea
                  id="whatYouWillLearn"
                  name="whatYouWillLearn"
                  maxLength="2000"
                  value={formData.whatYouWillLearn}
                  onChange={handleChange}
                  className="input textarea"
                  rows="4"
                />
                <div className="char-count">
                  {formData.whatYouWillLearn.length} / 2000 ký tự
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setActiveTab("basic")}
                  className="btn btn-outline"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("media")}
                  className="btn btn-primary"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA */}
          {activeTab === "media" && (
            <div className="form-section">
              <h2>Media & Hình ảnh</h2>

              <div className="media-upload-group">
                <label htmlFor="thumbnail">Hình ảnh khóa học (Thumbnail)</label>
                <div className="upload-area">
                  <input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="file-input"
                    disabled={loading || uploadingMedia}
                  />
                  <div className="upload-placeholder">
                    Click để chọn hoặc kéo thả hình ảnh
                  </div>
                </div>
                {thumbnailPreview && (
                  <div className="thumbnail-preview">
                    <img src={thumbnailPreview} alt="Thumbnail preview" />
                  </div>
                )}
                <small>
                  Định dạng: JPG, PNG | Tối đa: 5MB | Kích thước khuyến nghị:
                  1280x720px
                </small>
              </div>

              <div className="media-upload-group">
                <label htmlFor="previewVideo">Video preview khóa học</label>
                <div className="upload-area">
                  <input
                    id="previewVideo"
                    name="previewVideo"
                    type="file"
                    accept="video/*"
                    onChange={handlePreviewVideoChange}
                    className="file-input"
                    disabled={loading || uploadingMedia}
                  />
                  <div className="upload-placeholder">
                    Click để chọn hoặc kéo thả video
                  </div>
                </div>
                {previewVideoFile && (
                  <div className="file-selected">
                    Đã chọn: <strong>{previewVideoFile.name}</strong>
                  </div>
                )}
                <small>
                  Định dạng: MP4, WebM | Tối đa: 500MB | Độ dài khuyến nghị: 1-2
                  phút
                </small>
              </div>

              <div className="info-box">
                <h3>Gợi ý</h3>
                <ul>
                  <li>Cập nhật hình ảnh sẽ thay thế hình ảnh hiện tại</li>
                  <li>Video preview giúp học viên hiểu rõ nội dung</li>
                  <li>Bạn có thể cập nhật media bất kỳ lúc nào</li>
                </ul>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className="btn btn-outline"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    uploadingMedia ||
                    !formData.title.trim() ||
                    !formData.shortDescription.trim() ||
                    !formData.categoryId
                  }
                  className="btn btn-primary btn-submit"
                >
                  {loading
                    ? "Đang cập nhật..."
                    : uploadingMedia
                      ? "Đang tải lên..."
                      : "Cập nhật khóa học"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
