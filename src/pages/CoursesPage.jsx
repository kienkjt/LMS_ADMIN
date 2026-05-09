import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { courseService } from "../services/courseService";
import { categoryService } from "../services/categoryService";
import CourseCard from "../components/courses/CourseCard";
import CategoryFilter from "../components/courses/CategoryFilter";
import { SkeletonCard } from "../components/common/Loading";
import { PAGINATION } from "../utils/constants";
import "./CoursesPage.css";

const CoursesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    level: searchParams.get("level") || "",
    priceMin: "",
    priceMax: "",
  });

  // Load categories with error handling
  useEffect(() => {
    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const res = await categoryService.getAll();
        setCategories(res.data || []);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoriesError("Không thể tải danh mục");
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setCoursesError(null);
    try {
      console.log("[CoursesPage] Fetching courses with filters:", filters);
      const response = await courseService.search({
        keyword: filters.keyword?.trim() || undefined,
        categoryId: filters.category || undefined,
        level: filters.level || undefined,
        priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
        page,
        size: PAGINATION.DEFAULT_SIZE,
      });
      const pageData = response.data || {};
      const list = Array.isArray(pageData)
        ? pageData
        : pageData.content || pageData.items || [];
      const totalElements =
        pageData.totalElements ??
        pageData.total ??
        pageData.totalItems ??
        list.length;
      console.log("[CoursesPage] Courses response:", list.length);
      setCourses(list);
      setTotal(totalElements);
    } catch (error) {
      console.error("[CoursesPage] Failed to fetch courses:", error);
      setCoursesError("Không thể tải danh sách khóa học");
      setCourses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  // Fetch courses when component mounts and when filters/page change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(PAGINATION.DEFAULT_PAGE);
  };

  const clearFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      level: "",
      priceMin: "",
      priceMax: "",
    });
    setPage(PAGINATION.DEFAULT_PAGE);
    setSearchParams({});
  };

  const levelLabels = {
    BEGINNER: "Cơ bản",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Nâng cao",
  };

  const totalPages = Math.ceil(total / PAGINATION.DEFAULT_SIZE);

  return (
    <div className="courses-page">
      {/* Page Header */}
      <div className="courses-header">
        <div className="container">
          <h1>Tất cả khóa học</h1>
          <p>
            Khám phá {total > 0 ? total : "hàng nghìn"} khóa học chất lượng cao
          </p>
        </div>
      </div>

      <div className="container">
        <div className="courses-layout">
          {/* Sidebar Filters */}
          <aside className="courses-filters">
            <div className="filter-header">
              <h3>Bộ lọc</h3>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Xóa bộ lọc
              </button>
            </div>

            {/* Category */}
            <div className="filter-section">
              <CategoryFilter
                categories={categories}
                selectedCategory={filters.category}
                onCategoryChange={(categoryId) =>
                  handleFilterChange("category", categoryId)
                }
                loading={categoriesLoading}
                error={categoriesError}
                onRetry={() => {
                  setCategoriesLoading(true);
                  categoryService
                    .getAll()
                    .then((res) => {
                      setCategories(res.data || []);
                      setCategoriesError(null);
                    })
                    .catch((err) => {
                      console.error("Retry failed:", err);
                      setCategoriesError("Không thể tải danh mục");
                    })
                    .finally(() => setCategoriesLoading(false));
                }}
              />
            </div>

            {/* Level */}
            <div className="filter-section">
              <h4>Cấp độ</h4>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="level"
                    value=""
                    checked={!filters.level}
                    onChange={() => handleFilterChange("level", "")}
                  />
                  Tất cả
                </label>
                {Object.entries(levelLabels).map(([val, lbl]) => (
                  <label key={val} className="filter-option">
                    <input
                      type="radio"
                      name="level"
                      value={val}
                      checked={filters.level === val}
                      onChange={() => handleFilterChange("level", val)}
                    />
                    {lbl}
                  </label>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="filter-section">
              <h4>Giá (VND)</h4>
              <div className="price-range">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Từ"
                  value={filters.priceMin}
                  onChange={(e) =>
                    handleFilterChange("priceMin", e.target.value)
                  }
                />
                <span>-</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Đến"
                  value={filters.priceMax}
                  onChange={(e) =>
                    handleFilterChange("priceMax", e.target.value)
                  }
                />
              </div>
            </div>
          </aside>

          {/* Course List */}
          <div className="courses-main">
            {/* Results Count */}
            <div className="courses-sort-bar">
              <span className="results-count">
                {loading ? "Đang tải..." : `${total} khóa học`}
              </span>
              <input
                type="text"
                className="form-input courses-keyword-input"
                placeholder="Tìm theo tên khóa học..."
                value={filters.keyword}
                onChange={(e) => handleFilterChange("keyword", e.target.value)}
              />
            </div>

            {/* Grid */}
            <div className="course-grid">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              ) : coursesError ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <div className="empty-state-icon">⚠️</div>
                  <h3>{coursesError}</h3>
                  <p>Vui lòng thử lại hoặc liên hệ hỗ trợ</p>
                  <button
                    className="btn btn-outline"
                    onClick={() => fetchCourses()}
                  >
                    Thử lại
                  </button>
                </div>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <h3>Không tìm thấy khóa học</h3>
                  <p>Thử thay đổi bộ lọc để tìm kiếm kết quả khác</p>
                  <button className="btn btn-outline" onClick={clearFilters}>
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() =>
                    setPage((p) => Math.max(PAGINATION.DEFAULT_PAGE, p - 1))
                  }
                  disabled={page === PAGINATION.DEFAULT_PAGE}
                >
                  ←
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                  const pageNum = i + PAGINATION.DEFAULT_PAGE;
                  return (
                    <button
                      key={i}
                      className={`page-btn ${page === pageNum ? "active" : ""}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
