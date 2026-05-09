import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaBook,
  FaLayerGroup,
  FaPen,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { chapterService } from "../../services/chapterService";
import { courseService } from "../../services/courseService";
import { lessonService } from "../../services/lessonService";
import { formatDuration } from "../../utils/helpers";
import "./ChapterManagement.css";

const VIDEO_SOURCE = {
  YOUTUBE: "youtube",
  UPLOAD: "upload",
};

const createEmptyChapterForm = () => ({
  title: "",
  description: "",
});

const createEmptyLessonForm = () => ({
  title: "",
  description: "",
  type: "VIDEO",
  durationHours: "",
  durationMinutes: "",
  durationSeconds: "",
  freePreview: false,
  youtubeUrl: "",
  videoUrl: "",
  videoFile: null,
  content: "",
});

const toInt = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
};

const parseDurationParts = (durationInSeconds) => {
  const safeDuration = toInt(durationInSeconds);
  const hours = Math.floor(safeDuration / 3600);
  const minutes = Math.floor((safeDuration % 3600) / 60);
  const seconds = safeDuration % 60;

  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : "",
    seconds: seconds > 0 ? String(seconds) : "",
  };
};

const buildDurationInSeconds = (hours, minutes, seconds) => {
  return toInt(hours) * 3600 + toInt(minutes) * 60 + toInt(seconds);
};

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

const ChapterManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterFormData, setChapterFormData] = useState(
    createEmptyChapterForm(),
  );

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonSubmitting, setLessonSubmitting] = useState(false);
  const [videoSource, setVideoSource] = useState(VIDEO_SOURCE.YOUTUBE);
  const [lessonFormData, setLessonFormData] = useState(createEmptyLessonForm());
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState("");

  useEffect(() => {
    if (!courseId) return;

    courseService
      .getById(courseId)
      .then((res) => setCourse(res.data))
      .catch((err) => {
        console.error("Failed to load course:", err);
        toast.error("Không thể tải thông tin khóa học");
      })
      .finally(() => setCourseLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchChapters();
    }
  }, [courseId]);

  useEffect(() => {
    if (!lessonFormData.videoFile) {
      setUploadPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(lessonFormData.videoFile);
    setUploadPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [lessonFormData.videoFile]);

  const durationPreview = useMemo(() => {
    const totalSeconds = buildDurationInSeconds(
      lessonFormData.durationHours,
      lessonFormData.durationMinutes,
      lessonFormData.durationSeconds,
    );

    return totalSeconds > 0 ? formatDuration(totalSeconds) : "0 phút";
  }, [
    lessonFormData.durationHours,
    lessonFormData.durationMinutes,
    lessonFormData.durationSeconds,
  ]);

  const fetchChapters = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const res = await chapterService.getChaptersByCourse(courseId);
      setChapters(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Fetch chapters error:", error);
      toast.error("Không thể tải danh sách chương");
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChapterModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setChapterFormData({
        title: chapter.title || "",
        description: chapter.description || "",
      });
    } else {
      setEditingChapter(null);
      setChapterFormData(createEmptyChapterForm());
    }

    setShowModal(true);
  };

  const handleCloseChapterModal = () => {
    setShowModal(false);
    setEditingChapter(null);
    setChapterFormData(createEmptyChapterForm());
  };

  const handleSubmitChapter = async (event) => {
    event.preventDefault();

    if (!chapterFormData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề chương");
      return;
    }

    try {
      if (editingChapter) {
        await chapterService.updateChapter(
          courseId,
          editingChapter.id,
          chapterFormData,
        );
        toast.success("Cập nhật chương thành công");
      } else {
        await chapterService.createChapter(courseId, chapterFormData);
        toast.success("Tạo chương thành công");
      }

      handleCloseChapterModal();
      fetchChapters();
    } catch (error) {
      console.error("Submit chapter error:", error);
      toast.error(
        error.response?.data?.message ||
          (editingChapter
            ? "Không thể cập nhật chương"
            : "Không thể tạo chương"),
      );
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa chương này?")) return;

    try {
      await chapterService.deleteChapter(courseId, chapterId);
      setChapters((prev) => prev.filter((chapter) => chapter.id !== chapterId));
      toast.success("Xóa chương thành công");
    } catch (error) {
      console.error("Delete chapter error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa chương");
    }
  };

  const handleOpenLessonModal = (chapter, lesson = null) => {
    setSelectedChapterId(chapter.id);

    if (lesson) {
      const durationParts = parseDurationParts(lesson.duration || 0);
      const currentVideoUrl = lesson.videoUrl || "";
      const isYouTubeLesson = Boolean(extractYouTubeId(currentVideoUrl));

      setEditingLesson(lesson);
      setVideoSource(
        isYouTubeLesson ? VIDEO_SOURCE.YOUTUBE : VIDEO_SOURCE.UPLOAD,
      );
      setLessonFormData({
        title: lesson.title || "",
        description: lesson.description || "",
        type: lesson.type || "VIDEO",
        durationHours: durationParts.hours,
        durationMinutes: durationParts.minutes,
        durationSeconds: durationParts.seconds,
        freePreview: Boolean(lesson.freePreview ?? lesson.isFreePreview),
        youtubeUrl: isYouTubeLesson ? currentVideoUrl : "",
        videoUrl: currentVideoUrl,
        videoFile: null,
        content: lesson.content || "",
      });
    } else {
      setEditingLesson(null);
      setVideoSource(VIDEO_SOURCE.YOUTUBE);
      setLessonFormData(createEmptyLessonForm());
    }

    setShowLessonModal(true);
  };

  const handleCloseLessonModal = () => {
    setShowLessonModal(false);
    setSelectedChapterId(null);
    setEditingLesson(null);
    setVideoSource(VIDEO_SOURCE.YOUTUBE);
    setLessonFormData(createEmptyLessonForm());
  };

  const handleDeleteLesson = async (chapter, lesson) => {
    if (!window.confirm(`Xóa bài "${lesson.title}"?`)) return;

    try {
      await lessonService.deleteLesson(courseId, chapter.id, lesson.id);
      toast.success("Xóa bài học thành công");
      fetchChapters();
    } catch (error) {
      console.error("Delete lesson error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa bài học");
    }
  };

  const handleDurationInput = (field, maxValue) => (event) => {
    const value = event.target.value;

    if (value === "") {
      setLessonFormData((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return;

    const safeValue = Math.max(0, Math.min(maxValue, Math.floor(parsed)));
    setLessonFormData((prev) => ({ ...prev, [field]: String(safeValue) }));
  };

  const handleSubmitLesson = async (event) => {
    event.preventDefault();

    if (!lessonFormData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    const isVideoLesson = lessonFormData.type === "VIDEO";
    const durationInSeconds = isVideoLesson
      ? buildDurationInSeconds(
          lessonFormData.durationHours,
          lessonFormData.durationMinutes,
          lessonFormData.durationSeconds,
        )
      : 0;

    if (isVideoLesson && durationInSeconds <= 0) {
      toast.error("Vui lòng nhập thời lượng video theo giờ, phút hoặc giây");
      return;
    }

    let resolvedVideoUrl = "";

    if (isVideoLesson) {
      if (videoSource === VIDEO_SOURCE.YOUTUBE) {
        const youtubeUrl = lessonFormData.youtubeUrl.trim();
        const youtubeId = extractYouTubeId(youtubeUrl);

        if (!youtubeId) {
          toast.error("URL YouTube không hợp lệ");
          return;
        }

        resolvedVideoUrl = youtubeUrl;
      } else {
        const hasExistingUploadVideo = Boolean(
          editingLesson && lessonFormData.videoUrl,
        );
        const hasNewFile = Boolean(lessonFormData.videoFile);

        if (!hasExistingUploadVideo && !hasNewFile) {
          toast.error("Vui lòng chọn file video để tải lên");
          return;
        }

        resolvedVideoUrl = lessonFormData.videoUrl || "";
      }
    }

    const payload = {
      title: lessonFormData.title.trim(),
      description: lessonFormData.description || "",
      type: lessonFormData.type,
      duration: durationInSeconds,
      freePreview: Boolean(lessonFormData.freePreview),
      content:
        lessonFormData.type === "DOCUMENT" ? lessonFormData.content || "" : "",
      videoUrl: lessonFormData.type === "VIDEO" ? resolvedVideoUrl : "",
    };

    try {
      setLessonSubmitting(true);

      let lessonId = editingLesson?.id;

      if (editingLesson) {
        await lessonService.updateLesson(
          courseId,
          selectedChapterId,
          editingLesson.id,
          payload,
        );
        toast.success("Cập nhật bài học thành công");
      } else {
        const createRes = await lessonService.createLesson(
          courseId,
          selectedChapterId,
          payload,
        );
        lessonId = createRes.data?.id;
        toast.success("Tạo bài học thành công");
      }

      const shouldUploadVideo =
        lessonFormData.type === "VIDEO" &&
        videoSource === VIDEO_SOURCE.UPLOAD &&
        lessonFormData.videoFile &&
        lessonId;

      if (shouldUploadVideo) {
        toast.info("Đang tải video lên...");
        await lessonService.uploadLessonVideo(
          courseId,
          selectedChapterId,
          lessonId,
          lessonFormData.videoFile,
        );
        toast.success("Tải video lên thành công");
      }

      handleCloseLessonModal();
      fetchChapters();
    } catch (error) {
      console.error("Submit lesson error:", error);
      toast.error(
        error.response?.data?.message ||
          (editingLesson
            ? "Không thể cập nhật bài học"
            : "Không thể tạo bài học"),
      );
    } finally {
      setLessonSubmitting(false);
    }
  };

  const youtubePreviewId = extractYouTubeId(lessonFormData.youtubeUrl);
  const existingUploadVideoUrl =
    videoSource === VIDEO_SOURCE.UPLOAD &&
    !lessonFormData.videoFile &&
    lessonFormData.videoUrl &&
    !extractYouTubeId(lessonFormData.videoUrl)
      ? lessonFormData.videoUrl
      : "";

  if (courseLoading) {
    return (
      <div className="chapter-management">
        <p>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="chapter-management">
        <div className="empty-state">
          <p>Khóa học không tìm thấy</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-management">
      <div className="chapter-header">
        <button
          className="btn-back"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <FaArrowLeft size={20} />
        </button>

        <div className="header-content">
          <h1>Quản lý chương</h1>
          <p className="course-title">{course?.title}</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleOpenChapterModal()}
        >
          <FaPlus style={{ marginRight: "6px" }} /> Tạo chương mới
        </button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải chương...</p>
        </div>
      ) : chapters.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon">
            <FaBook size={48} />
          </div>
          <h3>Chưa có chương nào</h3>
          <p>Tạo chương đầu tiên để bắt đầu xây dựng khóa học</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
            onClick={() => handleOpenChapterModal()}
          >
            Tạo chương mới
          </button>
        </div>
      ) : (
        <div className="chapters-list">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="chapter-card">
              <div className="chapter-card-header">
                <div className="chapter-info">
                  <div className="chapter-number">
                    <FaLayerGroup size={16} />
                    <span>Chương {index + 1}</span>
                  </div>
                  <h3 className="chapter-title">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="chapter-description">{chapter.description}</p>
                  )}
                </div>

                <div className="chapter-stats">
                  <div className="stat">
                    <span className="stat-label">Bài học</span>
                    <span className="stat-value">
                      {chapter.totalLessons || chapter.lessons?.length || 0}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Thời lượng</span>
                    <span className="stat-value">
                      {formatDuration(chapter.totalDuration || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {Array.isArray(chapter.lessons) && chapter.lessons.length > 0 && (
                <div className="chapter-lessons">
                  <div className="lessons-header">
                    <h4 className="lessons-title">
                      Danh sách bài học ({chapter.lessons.length})
                    </h4>
                  </div>

                  <div className="lessons-list">
                    {chapter.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="lesson-item">
                        <div className="lesson-info">
                          <div className="lesson-header-info">
                            <span className="lesson-number">
                              #{lessonIndex + 1}
                            </span>
                            <span className="lesson-type-badge">
                              {lesson.type === "VIDEO" ? "VIDEO" : "DOCUMENT"}
                            </span>
                            {Boolean(
                              lesson.freePreview ?? lesson.isFreePreview,
                            ) && (
                              <span className="lesson-preview-chip">
                                Preview
                              </span>
                            )}
                            <h5 className="lesson-title">{lesson.title}</h5>
                          </div>

                          {lesson.description && (
                            <p className="lesson-description">
                              {lesson.description}
                            </p>
                          )}

                          <div className="lesson-meta">
                            {lesson.duration ? (
                              <span className="meta-item">
                                {formatDuration(lesson.duration)}
                              </span>
                            ) : null}
                            {lesson.type === "VIDEO" && lesson.videoUrl ? (
                              <span className="meta-item">Có video</span>
                            ) : null}
                          </div>
                        </div>

                        <div className="lesson-actions">
                          <button
                            className="btn-lesson btn-edit-lesson"
                            onClick={() =>
                              handleOpenLessonModal(chapter, lesson)
                            }
                            title="Chỉnh sửa bài"
                          >
                            <FaPen size={12} /> Sửa
                          </button>
                          <button
                            className="btn-lesson btn-delete-lesson"
                            onClick={() => handleDeleteLesson(chapter, lesson)}
                            title="Xóa bài"
                          >
                            <FaTrash size={12} /> Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="chapter-actions">
                <button
                  className="btn-icon btn-add"
                  onClick={() => handleOpenLessonModal(chapter)}
                  title="Thêm bài học"
                >
                  <FaPlus size={16} />
                  Thêm bài
                </button>
                <button
                  className="btn-icon btn-edit"
                  onClick={() => handleOpenChapterModal(chapter)}
                  title="Chỉnh sửa"
                >
                  <FaPen size={16} />
                  Sửa chương
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteChapter(chapter.id)}
                  title="Xóa"
                >
                  <FaTrash size={16} />
                  Xóa chương
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseChapterModal}>
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingChapter ? "Chỉnh sửa chương" : "Tạo chương mới"}</h2>
              <button className="modal-close" onClick={handleCloseChapterModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitChapter} className="chapter-form">
              <div className="form-group">
                <label htmlFor="chapter-title">
                  Tiêu đề chương <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="chapter-title"
                  className="form-input"
                  placeholder="Nhập tiêu đề chương"
                  value={chapterFormData.title}
                  onChange={(event) =>
                    setChapterFormData((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  maxLength={200}
                  required
                />
                <small className="text-muted">
                  {chapterFormData.title.length}/200 ký tự
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="chapter-description">Mô tả (tuỳ chọn)</label>
                <textarea
                  id="chapter-description"
                  className="form-textarea"
                  placeholder="Nhập mô tả chương"
                  value={chapterFormData.description}
                  onChange={(event) =>
                    setChapterFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  maxLength={2000}
                  rows={4}
                />
                <small className="text-muted">
                  {chapterFormData.description.length}/2000 ký tự
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseChapterModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingChapter ? "Cập nhật chương" : "Tạo chương"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showLessonModal && (
        <div className="modal-overlay" onClick={handleCloseLessonModal}>
          <div
            className="modal-content modal-lesson"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{editingLesson ? "Chỉnh sửa bài học" : "Tạo bài học mới"}</h2>
              <button className="modal-close" onClick={handleCloseLessonModal}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitLesson} className="lesson-form">
              <div className="form-group">
                <label htmlFor="lesson-title">
                  Tiêu đề bài học <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="lesson-title"
                  className="form-input"
                  placeholder="Nhập tiêu đề bài học"
                  value={lessonFormData.title}
                  onChange={(event) =>
                    setLessonFormData((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  maxLength={200}
                  required
                />
                <small className="text-muted">
                  {lessonFormData.title.length}/200 ký tự
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="lesson-type">
                  Loại bài học <span className="required">*</span>
                </label>
                <select
                  id="lesson-type"
                  className="form-input"
                  value={lessonFormData.type}
                  onChange={(event) =>
                    setLessonFormData((prev) => ({
                      ...prev,
                      type: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Tài liệu</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label" htmlFor="lesson-free-preview">
                  <input
                    id="lesson-free-preview"
                    type="checkbox"
                    checked={lessonFormData.freePreview}
                    onChange={(event) =>
                      setLessonFormData((prev) => ({
                        ...prev,
                        freePreview: event.target.checked,
                      }))
                    }
                  />
                  Cho phép học viên chưa mua xem preview bài học này
                </label>
              </div>

              {lessonFormData.type === "VIDEO" && (
                <>
                  <div className="form-group">
                    <label>
                      Nguồn video <span className="required">*</span>
                    </label>
                    <div className="video-source-tabs">
                      <button
                        type="button"
                        className={`tab-button ${
                          videoSource === VIDEO_SOURCE.YOUTUBE ? "active" : ""
                        }`}
                        onClick={() => setVideoSource(VIDEO_SOURCE.YOUTUBE)}
                      >
                        YouTube
                      </button>
                      <button
                        type="button"
                        className={`tab-button ${
                          videoSource === VIDEO_SOURCE.UPLOAD ? "active" : ""
                        }`}
                        onClick={() => setVideoSource(VIDEO_SOURCE.UPLOAD)}
                      >
                        Tải lên
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Thời lượng video (Giờ : Phút : Giây)
                      <span className="required">*</span>
                    </label>
                    <div className="duration-inputs">
                      <div className="duration-input-group">
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          placeholder="Giờ"
                          value={lessonFormData.durationHours}
                          onChange={handleDurationInput("durationHours", 999)}
                        />
                        <small>Giờ</small>
                      </div>

                      <div className="duration-input-group">
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="59"
                          placeholder="Phút"
                          value={lessonFormData.durationMinutes}
                          onChange={handleDurationInput("durationMinutes", 59)}
                        />
                        <small>Phút</small>
                      </div>

                      <div className="duration-input-group">
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="59"
                          placeholder="Giây"
                          value={lessonFormData.durationSeconds}
                          onChange={handleDurationInput("durationSeconds", 59)}
                        />
                        <small>Giây</small>
                      </div>
                    </div>
                    <small className="text-muted">
                      Tổng thời lượng: {durationPreview}
                    </small>
                  </div>

                  {videoSource === VIDEO_SOURCE.YOUTUBE && (
                    <div className="form-group">
                      <label htmlFor="lesson-youtube-url">
                        URL YouTube <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="lesson-youtube-url"
                        className="form-input"
                        placeholder="https://youtu.be/... hoặc https://youtube.com/watch?v=..."
                        value={lessonFormData.youtubeUrl}
                        onChange={(event) =>
                          setLessonFormData((prev) => ({
                            ...prev,
                            youtubeUrl: event.target.value,
                          }))
                        }
                        required
                      />
                      <small className="text-muted">
                        Hỗ trợ cả định dạng youtu.be và youtube.com
                      </small>

                      {youtubePreviewId && (
                        <div className="video-preview">
                          <p className="preview-label">Xem trước video</p>
                          <iframe
                            width="100%"
                            height="280"
                            src={`https://www.youtube.com/embed/${youtubePreviewId}`}
                            title="YouTube preview"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ borderRadius: "8px", marginTop: "12px" }}
                          ></iframe>
                        </div>
                      )}
                    </div>
                  )}

                  {videoSource === VIDEO_SOURCE.UPLOAD && (
                    <div className="form-group">
                      <label htmlFor="lesson-video-file">
                        Chọn file video <span className="required">*</span>
                      </label>
                      <input
                        type="file"
                        id="lesson-video-file"
                        className="form-input"
                        accept="video/*"
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setLessonFormData((prev) => ({
                            ...prev,
                            videoFile: file,
                          }));
                        }}
                      />

                      {lessonFormData.videoFile && (
                        <small className="text-muted">
                          File: {lessonFormData.videoFile.name} (
                          {(
                            lessonFormData.videoFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB)
                        </small>
                      )}

                      {!lessonFormData.videoFile && existingUploadVideoUrl && (
                        <small className="text-muted">
                          Đang dùng video hiện tại. Chọn file mới nếu muốn thay
                          thế.
                        </small>
                      )}

                      <small
                        className="text-muted"
                        style={{ display: "block" }}
                      >
                        Hỗ trợ: MP4, WebM, Ogg
                      </small>

                      {(uploadPreviewUrl || existingUploadVideoUrl) && (
                        <div className="video-preview">
                          <p className="preview-label">Xem trước video</p>
                          <video
                            width="100%"
                            height="280"
                            controls
                            style={{
                              borderRadius: "8px",
                              marginTop: "12px",
                              backgroundColor: "#000",
                            }}
                          >
                            <source
                              src={uploadPreviewUrl || existingUploadVideoUrl}
                            />
                            Trình duyệt của bạn không hỗ trợ phát video.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {lessonFormData.type === "DOCUMENT" && (
                <div className="form-group">
                  <label htmlFor="lesson-content">Nội dung tài liệu</label>
                  <textarea
                    id="lesson-content"
                    className="form-textarea"
                    placeholder="Nhập nội dung tài liệu"
                    value={lessonFormData.content}
                    onChange={(event) =>
                      setLessonFormData((prev) => ({
                        ...prev,
                        content: event.target.value,
                      }))
                    }
                    maxLength={10000}
                    rows={6}
                  />
                  <small className="text-muted">
                    {lessonFormData.content.length}/10000 ký tự
                  </small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="lesson-description">Mô tả (tuỳ chọn)</label>
                <textarea
                  id="lesson-description"
                  className="form-textarea"
                  placeholder="Nhập mô tả bài học"
                  value={lessonFormData.description}
                  onChange={(event) =>
                    setLessonFormData((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  maxLength={2000}
                  rows={3}
                />
                <small className="text-muted">
                  {lessonFormData.description.length}/2000 ký tự
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseLessonModal}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={lessonSubmitting}
                >
                  {lessonSubmitting
                    ? "Đang lưu..."
                    : editingLesson
                      ? "Cập nhật bài học"
                      : "Tạo bài học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterManagement;
