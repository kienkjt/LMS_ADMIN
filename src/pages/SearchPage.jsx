import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CourseCard from "../components/courses/CourseCard";
import { SkeletonCard } from "../components/common/Loading";
import { categoryService } from "../services/categoryService";
import { courseService } from "../services/courseService";
import "./SearchPage.css";

const PAGE_SIZE = 12;

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("q") || "";

  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(() => {
    const pageFromQuery = Number(searchParams.get("page"));
    return Number.isFinite(pageFromQuery) && pageFromQuery > 0
      ? pageFromQuery
      : 1;
  });

  const [filters, setFilters] = useState({
    categoryId: searchParams.get("categoryId") || "",
    level: searchParams.get("level") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    sort: searchParams.get("sort") || "",
  });

  useEffect(() => {
    const nextFilters = {
      categoryId: searchParams.get("categoryId") || "",
      level: searchParams.get("level") || "",
      priceMin: searchParams.get("priceMin") || "",
      priceMax: searchParams.get("priceMax") || "",
      sort: searchParams.get("sort") || "",
    };

    setFilters((prev) => {
      if (
        prev.categoryId === nextFilters.categoryId &&
        prev.level === nextFilters.level &&
        prev.priceMin === nextFilters.priceMin &&
        prev.priceMax === nextFilters.priceMax &&
        prev.sort === nextFilters.sort
      ) {
        return prev;
      }
      return nextFilters;
    });

    const pageFromQuery = Number(searchParams.get("page"));
    const nextPage =
      Number.isFinite(pageFromQuery) && pageFromQuery > 0 ? pageFromQuery : 1;

    setPage((prev) => (prev === nextPage ? prev : nextPage));
  }, [searchParams]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryService.getAll();
        const categoryList = response.data?.content || response.data || [];
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadSearchResult = async () => {
      try {
        setLoading(true);

        const payload = {
          keyword: keyword || undefined,
          categoryId: filters.categoryId || undefined,
          level: filters.level || undefined,
          priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
          priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
          sort: filters.sort || undefined,
          page,
          size: PAGE_SIZE,
        };

        const response = await courseService.search(payload);
        const pageData = response.data;
        setCourses(pageData?.content || pageData || []);
        setTotalElements(pageData?.totalElements || 0);
      } catch (error) {
        console.error("Search failed:", error);
        setCourses([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    loadSearchResult();
  }, [keyword, filters, page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalElements / PAGE_SIZE)),
    [totalElements],
  );

  const updateSearchParams = (nextFilters, nextPage = 1) => {
    const params = new URLSearchParams();

    if (keyword) params.set("q", keyword);
    if (nextFilters.categoryId)
      params.set("categoryId", nextFilters.categoryId);
    if (nextFilters.level) params.set("level", nextFilters.level);
    if (nextFilters.priceMin) params.set("priceMin", nextFilters.priceMin);
    if (nextFilters.priceMax) params.set("priceMax", nextFilters.priceMax);
    if (nextFilters.sort) params.set("sort", nextFilters.sort);
    if (nextPage > 1) params.set("page", String(nextPage));

    setSearchParams(params);
  };

  const handleFilterChange = (name, value) => {
    setPage(1);
    setFilters((prev) => {
      const next = { ...prev, [name]: value };
      updateSearchParams(next, 1);
      return next;
    });
  };

  const clearFilters = () => {
    const reset = {
      categoryId: "",
      level: "",
      priceMin: "",
      priceMax: "",
      sort: "",
    };
    setPage(1);
    setFilters(reset);
    updateSearchParams(reset, 1);
  };

  const handlePageChange = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(safePage);
    updateSearchParams(filters, safePage);
  };

  return (
    <div className="container search-page">
      <div className="search-page-header">
        <h1>Ket qua tim kiem</h1>
        {keyword ? (
          <p>
            {loading
              ? "Dang tim kiem..."
              : `${totalElements} ket qua cho ${keyword}`}
          </p>
        ) : (
          <p>
            Loc theo danh muc, cap do va khoang gia de tim khoa hoc phu hop.
          </p>
        )}
      </div>

      <div className="search-layout">
        <aside className="search-filters">
          <div className="filter-group">
            <label htmlFor="search-category">Danh muc</label>
            <select
              id="search-category"
              value={filters.categoryId}
              onChange={(event) =>
                handleFilterChange("categoryId", event.target.value)
              }
              disabled={categoriesLoading}
            >
              <option value="">Tat ca</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="search-level">Cap do</label>
            <select
              id="search-level"
              value={filters.level}
              onChange={(event) =>
                handleFilterChange("level", event.target.value)
              }
            >
              <option value="">Tat ca</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>

          <div className="filter-group price-grid">
            <div>
              <label htmlFor="search-price-min">Gia tu</label>
              <input
                id="search-price-min"
                type="number"
                min="0"
                value={filters.priceMin}
                onChange={(event) =>
                  handleFilterChange("priceMin", event.target.value)
                }
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="search-price-max">Gia den</label>
              <input
                id="search-price-max"
                type="number"
                min="0"
                value={filters.priceMax}
                onChange={(event) =>
                  handleFilterChange("priceMax", event.target.value)
                }
                placeholder="1000000"
              />
            </div>
          </div>

          <div className="filter-group">
            <label htmlFor="search-sort">Sap xep</label>
            <select
              id="search-sort"
              value={filters.sort}
              onChange={(event) =>
                handleFilterChange("sort", event.target.value)
              }
            >
              <option value="">Mac dinh</option>
              <option value="popular">Pho bien</option>
              <option value="newest">Moi nhat</option>
              <option value="rating">Danh gia cao</option>
            </select>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            Xoa bo loc
          </button>
        </aside>

        <section className="search-results">
          <div className="course-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              : courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
          </div>

          {!loading && courses.length === 0 && (
            <div className="search-empty-state">
              <div className="empty-state-icon">Search</div>
              <h3>Khong tim thay ket qua</h3>
              <p>Thu bo loc khac hoac mo rong khoang gia tim kiem.</p>
            </div>
          )}

          {!loading && courses.length > 0 && (
            <div className="search-pagination">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Trang truoc
              </button>
              <span>
                Trang {page} / {totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Trang sau
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SearchPage;
