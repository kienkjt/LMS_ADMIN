import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { enrollmentService } from "../services/enrollmentService";
import { chapterService } from "../services/chapterService";
import { ROUTES } from "../utils/constants";
import { formatDuration } from "../utils/helpers";
import VideoPlayer from "../components/common/VideoPlayer";
import Loading from "../components/common/Loading";
import {
  FaCheck,
  FaBookmark,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./LearningPage.css";

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [completing, setCompleting] = useState(false);

  // Load course, chapters, and enrollment data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load course
        const courseRes = await api.get(`/v1/courses/${courseId}`);
        const courseData = courseRes.data?.data || courseRes.data;
        setCourse(courseData);

        // Check enrollment
        try {
          const enrollRes = await enrollmentService.getEnrollment(courseId);
          if (!enrollRes.data) {
            throw new Error("Enrollment not found");
          }

          // Load progress
          const progressRes = await enrollmentService.getProgress(courseId);
          setProgress(progressRes.data);
        } catch {
          toast.info("Bạn chưa đăng ký khóa học này");
          setTimeout(() => {
            navigate(`${ROUTES.COURSE_DETAIL}/${courseData.slug || courseId}`);
          }, 1500);
          return;
        }

        // Load chapters
        try {
          const chaptersRes =
            await chapterService.getChaptersByCourse(courseId);
          const chaptersData = chaptersRes.data || [];
          setChapters(chaptersData);

          // Initialize expanded chapters
          const expanded = {};
          chaptersData.forEach((_, idx) => {
            expanded[idx] = idx === 0; // Expand first chapter
          });
          setExpandedChapters(expanded);

          // Set first lesson as current if available
          if (chaptersData.length > 0 && chaptersData[0]?.lessons?.length > 0) {
            setCurrentLesson(chaptersData[0].lessons[0]);
          }
        } catch (error) {
          console.error("Error loading chapters:", error);
        }
      } catch (error) {
        console.error("Error loading learning page:", error);
        toast.error("Không thể tải khóa học");
        navigate(ROUTES.STUDENT_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, navigate]);

  // Handle lesson completion
  const handleCompleteLesson = async () => {
    if (!currentLesson || completing) return;

    try {
      setCompleting(true);
      await enrollmentService.completeLesson(courseId, currentLesson.id);

      // Update completed lessons set
      setCompletedLessons(new Set([...completedLessons, currentLesson.id]));

      // Refresh progress
      const progressRes = await enrollmentService.getProgress(courseId);
      setProgress(progressRes.data);

      toast.success("Bài học đã hoàn thành!");
    } catch (error) {
      console.error("Error completing lesson:", error);
      toast.error("Lỗi khi hoàn thành bài học");
    } finally {
      setCompleting(false);
    }
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterIdx) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIdx]: !prev[chapterIdx],
    }));
  };

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Khóa học không tìm thấy
      </div>
    );
  }

  const progressPercentage = progress?.progressPercent || 0;

  return (
    <div className="learning-page">
      {/* Header */}
      <div className="learning-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-sidebar-toggle"
          title={sidebarOpen ? "Ẩn" : "Hiện"}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <div className="header-content">
          <h1>{course.title}</h1>
          <div className="progress-info">
            <div className="progress-bar-small">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {progressPercentage}% hoàn thành
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate(ROUTES.STUDENT_DASHBOARD)}
          className="btn-back-header"
          title="Quay lại danh sách khóa học"
        >
          <FaArrowLeft />
        </button>
      </div>

      <div className="learning-container">
        {/* Sidebar - Course content */}
        {sidebarOpen && (
          <aside className="learning-sidebar">
            <div className="sidebar-header">
              <h3>Nội dung khóa học</h3>
              <span className="lesson-count">
                {chapters.reduce(
                  (sum, ch) => sum + (ch.lessons?.length || 0),
                  0,
                )}{" "}
                bài
              </span>
            </div>

            <div className="chapters-list">
              {chapters.map((chapter, chapterIdx) => (
                <div key={chapter.id} className="chapter-item">
                  <button
                    className="chapter-header"
                    onClick={() => toggleChapter(chapterIdx)}
                  >
                    <span className="chapter-icon">
                      {expandedChapters[chapterIdx] ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                    <span className="chapter-title">{chapter.title}</span>
                    <span className="lesson-badge">
                      {chapter.lessons?.filter((l) =>
                        completedLessons.has(l.id),
                      ).length || 0}
                      /{chapter.lessons?.length || 0}
                    </span>
                  </button>

                  {expandedChapters[chapterIdx] && (
                    <div className="lessons-list">
                      {chapter.lessons?.map((lesson) => (
                        <button
                          key={lesson.id}
                          className={`lesson-item ${
                            currentLesson?.id === lesson.id ? "active" : ""
                          } ${completedLessons.has(lesson.id) ? "completed" : ""}`}
                          onClick={() => setCurrentLesson(lesson)}
                        >
                          <span className="lesson-icon">
                            {completedLessons.has(lesson.id) ? (
                              <FaCheck size={12} />
                            ) : (
                              "▶"
                            )}
                          </span>
                          <span className="lesson-title">{lesson.title}</span>
                          {lesson.duration && (
                            <span className="lesson-duration">
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="learning-main">
          {currentLesson ? (
            <div className="lesson-content">
              <div className="lesson-header">
                <h2>{currentLesson.title}</h2>
                {currentLesson.duration && (
                  <span className="lesson-meta">
                    ⏱ {formatDuration(currentLesson.duration)}
                  </span>
                )}
              </div>

              {/* Video player or content */}
              {currentLesson.type === "VIDEO" ? (
                <VideoPlayer
                  videoUrl={currentLesson.videoUrl}
                  videoTitle={currentLesson.title}
                  onCompleted={handleCompleteLesson}
                />
              ) : currentLesson.content ? (
                <div className="lesson-document">{currentLesson.content}</div>
              ) : (
                <div className="no-content">
                  <p>Nội dung bài học đang được chuẩn bị</p>
                </div>
              )}

              {/* Actions */}
              <div className="lesson-actions">
                <button
                  className={`btn btn-primary ${
                    completedLessons.has(currentLesson.id) ? "completed" : ""
                  }`}
                  onClick={handleCompleteLesson}
                  disabled={
                    completing || completedLessons.has(currentLesson.id)
                  }
                >
                  {completedLessons.has(currentLesson.id) ? (
                    <>
                      <FaCheck /> Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <FaCheck /> Đánh dấu hoàn thành
                    </>
                  )}
                </button>
                <button className="btn btn-ghost">
                  <FaBookmark /> Đánh dấu
                </button>
              </div>

              {/* Description */}
              {currentLesson.description && (
                <div className="lesson-description">
                  <h3>Mô tả bài học</h3>
                  <p>{currentLesson.description}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="lesson-navigation">
                {/* Find previous lesson */}
                {(() => {
                  let prevLesson = null;
                  for (
                    let i = chapters.length - 1;
                    i >= 0 && !prevLesson;
                    i--
                  ) {
                    const chapter = chapters[i];
                    const lessonIdx = chapter.lessons?.findIndex(
                      (l) => l.id === currentLesson.id,
                    );
                    if (lessonIdx !== undefined && lessonIdx > 0) {
                      prevLesson = chapter.lessons[lessonIdx - 1];
                    } else if (
                      lessonIdx === 0 &&
                      i > 0 &&
                      chapters[i - 1].lessons?.length
                    ) {
                      prevLesson =
                        chapters[i - 1].lessons[
                          chapters[i - 1].lessons.length - 1
                        ];
                    }
                  }
                  return prevLesson ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => setCurrentLesson(prevLesson)}
                    >
                      ← Bài trước
                    </button>
                  ) : null;
                })()}

                {/* Find next lesson */}
                {(() => {
                  let nextLesson = null;
                  for (let i = 0; i < chapters.length && !nextLesson; i++) {
                    const chapter = chapters[i];
                    const lessonIdx = chapter.lessons?.findIndex(
                      (l) => l.id === currentLesson.id,
                    );
                    if (
                      lessonIdx !== undefined &&
                      lessonIdx < chapter.lessons.length - 1
                    ) {
                      nextLesson = chapter.lessons[lessonIdx + 1];
                    } else if (
                      lessonIdx === chapter.lessons.length - 1 &&
                      i < chapters.length - 1 &&
                      chapters[i + 1].lessons?.length
                    ) {
                      nextLesson = chapters[i + 1].lessons[0];
                    }
                  }
                  return nextLesson ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentLesson(nextLesson)}
                    >
                      Bài tiếp →
                    </button>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Chào mừng đến với khóa học!</h3>
              <p>Hãy chọn một bài học từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningPage;
