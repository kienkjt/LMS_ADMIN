import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import { ROUTES, COURSE_STATUS, COURSE_LEVELS } from "../../utils/constants";
import { toast } from "react-toastify";
import {
  FaBook,
  FaPlus,
  FaPen,
  FaCheck,
  FaTimes,
  FaTrash,
  FaImage,
  FaVideo,
  FaListUl,
} from "react-icons/fa";
import "./CoursesManagement.css";

const CoursesManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await courseService.getMyInstructorCourses({
        page: 1,
        size: 50,
      });
      setCourses(res.data?.content || res.data || []);
    } catch (error) {
      console.error("Fetch courses error:", error);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa khóa học này?")) return;
    try {
      await courseService.delete(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
      toast.success("Xóa khóa học thành công");
    } catch (error) {
      console.error("Delete course error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa khóa học");
    }
  };

  const handlePublish = async (course) => {
    try {
      setUploadingId(course.id);
      const updated = await courseService.publishCourse(course.id);
      setCourses(courses.map((c) => (c.id === course.id ? updated.data : c)));
      toast.success(
        updated.data?.status === COURSE_STATUS.PENDING_REVIEW
          ? "Gửi duyệt khóa học thành công"
          : "Công khai khóa học thành công",
      );
    } catch (error) {
      console.error("Publish course error:", error);
      toast.error(
        error.response?.data?.message || "Không thể cập nhật trạng thái khóa học",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleUnpublish = async (course) => {
    if (!window.confirm("Bạn chắc chắn muốn hủy công khai khóa học này?"))
      return;
    try {
      setUploadingId(course.id);
      const updated = await courseService.unpublishCourse(course.id);
      setCourses(courses.map((c) => (c.id === course.id ? updated.data : c)));
      toast.success("Hủy công khai khóa học thành công");
    } catch (error) {
      console.error("Unpublish course error:", error);
      toast.error(
        error.response?.data?.message || "Không thể hủy công khai khóa học",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleUploadImage = async (courseId, file) => {
    if (!file) return;
    try {
      setUploadingId(courseId);
      const updated = await courseService.uploadCourseImage(courseId, file);
      setCourses(courses.map((c) => (c.id === courseId ? updated.data : c)));
      toast.success("Tải lên hình ảnh thành công");
      setShowMediaModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Upload image error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lên hình ảnh",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const handleUploadVideo = async (courseId, file) => {
    if (!file) return;
    try {
      setUploadingId(courseId);
      const updated = await courseService.uploadCoursePreviewVideo(
        courseId,
        file,
      );
      setCourses(courses.map((c) => (c.id === courseId ? updated.data : c)));
      toast.success("Tải lên video preview thành công");
      setShowMediaModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error("Upload video error:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải lên video preview",
      );
    } finally {
      setUploadingId(null);
    }
  };

  const openMediaModal = (course) => {
    setSelectedCourse(course);
    setShowMediaModal(true);
  };

  const filteredCourses = courses.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Quản lý khóa học</h1>
          <p>Tạo, sửa, xóa và quản lý các khóa học của bạn</p>
        </div>
        <Link to={ROUTES.INSTRUCTOR_CREATE_COURSE} className="btn btn-primary">
          <FaPlus style={{ marginRight: "6px" }} /> Tạo khóa học mới
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-body">
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: "250px" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
              style={{ minWidth: "180px" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value={COURSE_STATUS.DRAFT}>Nháp</option>
              <option value={COURSE_STATUS.PENDING_REVIEW}>Chờ duyệt</option>
              <option value={COURSE_STATUS.APPROVED}>Đã duyệt</option>
              <option value={COURSE_STATUS.PUBLISHED}>Công khai</option>
              <option value={COURSE_STATUS.REJECTED}>Bị từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon">
            <FaBook size={48} />
          </div>
          <h3>Chưa có khóa học nào</h3>
          <p>
            {search
              ? "Không tìm thấy khóa học phù hợp"
              : "Tạo khóa học đầu tiên của bạn ngay hôm nay"}
          </p>
          {!search && (
            <Link
              to={ROUTES.INSTRUCTOR_CREATE_COURSE}
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              Tạo khóa học
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Mức độ</th>
                  <th>Giá</th>
                  <th>Học sinh</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {course.thumbnail && (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            style={{
                              width: "48px",
                              height: "36px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {course.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            ID: {course.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {course.level === COURSE_LEVELS.BEGINNER && "Cơ bản"}
                        {course.level === COURSE_LEVELS.INTERMEDIATE &&
                          "Trung bình"}
                        {course.level === COURSE_LEVELS.ADVANCED && "Nâng cao"}
                      </span>
                    </td>
                    <td>{course.price?.toLocaleString("vi") || "0"} đ</td>
                    <td>{course.totalStudents || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          course.status === COURSE_STATUS.PUBLISHED
                            ? "badge-success"
                            : course.status === COURSE_STATUS.APPROVED
                              ? "badge-info"
                              : course.status === COURSE_STATUS.PENDING_REVIEW
                                ? "badge-warning"
                                : course.status === COURSE_STATUS.REJECTED
                                  ? "badge-danger"
                                  : "badge-gray"
                        }`}
                      >
                        {course.status === COURSE_STATUS.PUBLISHED
                          ? "Công khai"
                          : course.status === COURSE_STATUS.APPROVED
                            ? "Đã duyệt"
                            : course.status === COURSE_STATUS.PENDING_REVIEW
                              ? "Chờ duyệt"
                              : course.status === COURSE_STATUS.REJECTED
                                ? "Bị từ chối"
                                : "Nháp"}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `${ROUTES.INSTRUCTOR_EDIT_COURSE.replace(":courseId", course.id)}`,
                            )
                          }
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          <FaPen style={{ marginRight: "4px" }} /> Sửa
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `${ROUTES.INSTRUCTOR_CHAPTERS.replace(":courseId", course.id)}`,
                            )
                          }
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                          title="Quản lý chương"
                        >
                          <FaListUl style={{ marginRight: "4px" }} /> Chương
                        </button>
                        <button
                          onClick={() => openMediaModal(course)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                          title="Tải lên hình ảnh và video"
                        >
                          <FaImage style={{ marginRight: "4px" }} /> Media
                        </button>
                        {(course.status === COURSE_STATUS.DRAFT ||
                          course.status === COURSE_STATUS.REJECTED) && (
                          <button
                            onClick={() => handlePublish(course)}
                            disabled={uploadingId === course.id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                          >
                            <FaCheck style={{ marginRight: "4px" }} />
                            {uploadingId === course.id ? "..." : "Gửi duyệt"}
                          </button>
                        )}
                        {course.status === COURSE_STATUS.APPROVED && (
                          <button
                            onClick={() => handlePublish(course)}
                            disabled={uploadingId === course.id}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                          >
                            <FaCheck style={{ marginRight: "4px" }} />
                            {uploadingId === course.id ? "..." : "Công khai"}
                          </button>
                        )}
                        {course.status === COURSE_STATUS.PUBLISHED && (
                          <button
                            onClick={() => handleUnpublish(course)}
                            disabled={uploadingId === course.id}
                            className="btn btn-warning btn-sm"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                          >
                            <FaTimes style={{ marginRight: "4px" }} />
                            {uploadingId === course.id
                              ? "..."
                              : "Hủy công khai"}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={uploadingId === course.id}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          <FaTrash style={{ marginRight: "4px" }} /> Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Media Upload Modal */}
      {showMediaModal && selectedCourse && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ marginBottom: "24px" }}>Tải lên media</h2>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
              Khóa học: <strong>{selectedCourse.title}</strong>
            </p>

            {/* Thumbnail Upload */}
            <div style={{ marginBottom: "32px" }}>
              <label
                style={{
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "600",
                }}
              >
                Hình ảnh khóa học
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadImage(selectedCourse.id, file);
                }}
                disabled={uploadingId === selectedCourse.id}
                style={{ width: "100%" }}
              />
              <small>Định dạng: JPG, PNG. Tối đa 5MB</small>
            </div>

            {/* Preview Video Upload */}
            <div style={{ marginBottom: "24px" }}>
              <label
                style={{
                  marginBottom: "8px",
                  display: "block",
                  fontWeight: "600",
                }}
              >
                Video preview
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadVideo(selectedCourse.id, file);
                }}
                disabled={uploadingId === selectedCourse.id}
                style={{ width: "100%" }}
              />
              <small>Định dạng: MP4, WebM. Tối đa 500MB</small>
            </div>

            <button
              onClick={() => {
                setShowMediaModal(false);
                setSelectedCourse(null);
              }}
              className="btn btn-outline"
              style={{ width: "100%" }}
              disabled={uploadingId === selectedCourse.id}
            >
              {uploadingId === selectedCourse.id ? "Đang tải..." : "Đóng"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
