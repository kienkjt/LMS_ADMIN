import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { adminCourseService } from '../../services/adminService';
import './Admin.css';
import './StudentProgress.css';

const LESSON_TYPE_MAP = {
  VIDEO: { icon: '▶', label: 'Video', color: '#8b5cf6' },
  TEXT: { icon: '📄', label: 'Bài đọc', color: '#3b82f6' },
  QUIZ: { icon: '✎', label: 'Bài kiểm tra', color: '#f59e0b' },
  ASSIGNMENT: { icon: '📝', label: 'Bài tập', color: '#10b981' },
  DOCUMENT: { icon: '📋', label: 'Tài liệu', color: '#6366f1' },
};

const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDuration = (minutes) => {
  if (!minutes) return '—';
  if (minutes < 60) return `${minutes} phút`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hrs}h ${mins}p` : `${hrs}h`;
};

const StudentProgress = () => {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});

  useEffect(() => {
    fetchProgress();
  }, [courseId, studentId]);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await adminCourseService.getStudentProgress(courseId, studentId);
      setData(res.data);
      // Auto-expand all chapters
      if (res.data?.lessons) {
        const chapters = {};
        res.data.lessons.forEach((l) => {
          if (l.chapterId) chapters[l.chapterId] = true;
        });
        chapters['no-chapter'] = true;
        setExpandedChapters(chapters);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể tải tiến độ học viên');
    } finally {
      setLoading(false);
    }
  };

  // Group lessons by chapterId
  const chaptersGrouped = useMemo(() => {
    if (!data?.lessons) return [];
    const map = new Map();
    data.lessons.forEach((lesson) => {
      const key = lesson.chapterId || 'no-chapter';
      if (!map.has(key)) {
        map.set(key, { chapterId: key, lessons: [] });
      }
      map.get(key).lessons.push(lesson);
    });
    return Array.from(map.values());
  }, [data]);

  const toggleChapter = (chapterId) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const progressPercent = data?.progressPercent ? Number(data.progressPercent) : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="sp-loading">
          <div className="sp-loading-ring">
            <div className="sp-pulse-ring"></div>
            <div className="sp-pulse-ring delay"></div>
          </div>
          <span>Đang tải tiến độ học viên...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="admin-page">
        <div className="sp-error-state">
          <div className="sp-error-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <h3>Không tìm thấy dữ liệu</h3>
          <p>Không thể tải thông tin tiến độ cho học viên này.</p>
          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="sp-header">
        <button className="sp-back-btn" onClick={() => navigate(-1)} title="Quay lại">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="sp-header-content">
          <h1 className="admin-page-title">Tiến độ học viên</h1>
          <p className="admin-page-subtitle">{data.courseTitle}</p>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="sp-student-card">
        <div className="sp-student-info">
          <div className="sp-avatar">
            {data.studentAvatar ? (
              <img src={data.studentAvatar} alt={data.studentName} />
            ) : (
              <div className="sp-avatar-placeholder">
                {data.studentName?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className={`sp-status-dot ${progressPercent === 100 ? 'completed' : 'active'}`}></div>
          </div>
          <div className="sp-student-details">
            <h2 className="sp-student-name">{data.studentName || 'Không rõ'}</h2>
            <div className="sp-student-meta">
              <span className="sp-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {data.studentEmail}
              </span>
              <span className="sp-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Đăng ký: {formatDateTime(data.enrolledAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="sp-progress-ring-wrapper">
          <svg className="sp-progress-ring" viewBox="0 0 120 120">
            <circle
              className="sp-ring-bg"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
            />
            <circle
              className="sp-ring-fill"
              cx="60"
              cy="60"
              r="54"
              fill="none"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                '--progress-color':
                  progressPercent === 100
                    ? 'var(--success)'
                    : progressPercent >= 50
                    ? 'var(--primary)'
                    : 'var(--warning)',
              }}
            />
          </svg>
          <div className="sp-ring-label">
            <span className="sp-ring-value">{progressPercent.toFixed(0)}</span>
            <span className="sp-ring-unit">%</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="sp-stats-grid">
        <div className="sp-stat-card stat-total">
          <div className="sp-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{data.totalLessons}</span>
            <span className="sp-stat-label">Tổng bài học</span>
          </div>
        </div>
        <div className="sp-stat-card stat-completed">
          <div className="sp-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{data.completedLessons}</span>
            <span className="sp-stat-label">Đã hoàn thành</span>
          </div>
        </div>
        <div className="sp-stat-card stat-remaining">
          <div className="sp-stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value">{data.totalLessons - data.completedLessons}</span>
            <span className="sp-stat-label">Còn lại</span>
          </div>
        </div>
        <div className="sp-stat-card stat-status">
          <div className="sp-stat-icon">
            {data.completedAt ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
          <div className="sp-stat-info">
            <span className="sp-stat-value sp-stat-text">
              {data.completedAt ? 'Hoàn thành' : 'Đang học'}
            </span>
            <span className="sp-stat-label">
              {data.completedAt ? formatDateTime(data.completedAt) : 'Trạng thái'}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons by Chapter */}
      <div className="sp-chapters-section">
        <h3 className="sp-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          Chi tiết từng bài học
        </h3>

        {chaptersGrouped.map((chapter, chapterIdx) => {
          const isExpanded = expandedChapters[chapter.chapterId];
          const completedInChapter = chapter.lessons.filter((l) => l.completed).length;
          const totalInChapter = chapter.lessons.length;
          const chapterPercent = totalInChapter > 0 ? (completedInChapter / totalInChapter) * 100 : 0;

          return (
            <div key={chapter.chapterId} className={`sp-chapter-card ${isExpanded ? 'expanded' : ''}`}>
              <button
                className="sp-chapter-header"
                onClick={() => toggleChapter(chapter.chapterId)}
                id={`btn-chapter-${chapter.chapterId}`}
              >
                <div className="sp-chapter-left">
                  <div className={`sp-chapter-indicator ${chapterPercent === 100 ? 'complete' : chapterPercent > 0 ? 'in-progress' : ''}`}>
                    {chapterPercent === 100 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <span>{chapterIdx + 1}</span>
                    )}
                  </div>
                  <div className="sp-chapter-info">
                    <span className="sp-chapter-title">
                      {chapter.chapterId === 'no-chapter' ? 'Bài học chưa phân chương' : `Chương ${chapterIdx + 1}`}
                    </span>
                    <span className="sp-chapter-meta">
                      {completedInChapter}/{totalInChapter} bài học
                    </span>
                  </div>
                </div>
                <div className="sp-chapter-right">
                  <div className="sp-chapter-progress-mini">
                    <div className="sp-chapter-progress-bar">
                      <div
                        className="sp-chapter-progress-fill"
                        style={{ width: `${chapterPercent}%` }}
                      ></div>
                    </div>
                    <span className="sp-chapter-percent">{chapterPercent.toFixed(0)}%</span>
                  </div>
                  <svg
                    className={`sp-chevron ${isExpanded ? 'rotated' : ''}`}
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="sp-chapter-lessons">
                  {chapter.lessons.map((lesson, lessonIdx) => {
                    const typeInfo = LESSON_TYPE_MAP[lesson.lessonType] || {
                      icon: '📖',
                      label: lesson.lessonType,
                      color: '#6b7280',
                    };

                    return (
                      <div
                        key={lesson.lessonId}
                        className={`sp-lesson-row ${lesson.completed ? 'completed' : 'pending'}`}
                      >
                        <div className="sp-lesson-connector">
                          <div className={`sp-lesson-dot ${lesson.completed ? 'done' : ''}`}>
                            {lesson.completed ? (
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : (
                              <span className="sp-lesson-num">{lessonIdx + 1}</span>
                            )}
                          </div>
                          {lessonIdx < chapter.lessons.length - 1 && (
                            <div className={`sp-lesson-line ${lesson.completed ? 'done' : ''}`}></div>
                          )}
                        </div>
                        <div className="sp-lesson-content">
                          <div className="sp-lesson-main">
                            <div className="sp-lesson-title-row">
                              <span
                                className="sp-lesson-type-badge"
                                style={{
                                  '--type-color': typeInfo.color,
                                }}
                              >
                                <span className="sp-type-icon">{typeInfo.icon}</span>
                                {typeInfo.label}
                              </span>
                              <span className="sp-lesson-title">{lesson.lessonTitle}</span>
                            </div>
                            <div className="sp-lesson-meta-row">
                              {lesson.duration && (
                                <span className="sp-lesson-duration">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                  {formatDuration(lesson.duration)}
                                </span>
                              )}
                              {lesson.completed && lesson.completedAt && (
                                <span className="sp-lesson-completed-at">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  {formatDateTime(lesson.completedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="sp-lesson-status">
                            {lesson.completed ? (
                              <span className="sp-badge-done">Hoàn thành</span>
                            ) : (
                              <span className="sp-badge-pending">Chưa học</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentProgress;
