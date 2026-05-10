import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import { categoryService } from "../services/categoryService";
import CourseCard from "../components/courses/CourseCard";
import { SkeletonCard } from "../components/common/Loading";
import { ROUTES } from "../utils/constants";
import {
  FaRocket,
  FaBook,
  FaTrophy,
  FaHeadset,
  FaLaptop,
  FaPalette,
  FaMobileAlt,
  FaChartBar,
  FaGlobe,
  FaFilm,
  FaMusic,
} from "react-icons/fa";
import "./HomePage.css";

const HomePage = () => {
  const [popularCourses, setPopularCourses] = useState([]);
  const [newestCourses, setNewestCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [popularRes, newestRes, catRes] = await Promise.allSettled([
          courseService.getPopular(),
          courseService.getNewest(),
          categoryService.getAll(),
        ]);
        if (popularRes.status === "fulfilled")
          setPopularCourses(popularRes.value.data?.slice(0, 8) || []);
        if (newestRes.status === "fulfilled")
          setNewestCourses(newestRes.value.data?.slice(0, 6) || []);
        if (catRes.status === "fulfilled")
          setCategories(catRes.value.data?.slice(0, 8) || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim())
      navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(search.trim())}`);
  };

  const features = [
    {
      icon: <FaBook className="feature-icon-element" />,
      title: "Học theo lộ trình",
      desc: "Các khóa học được thiết kế bài bản, từ cơ bản đến nâng cao giúp bạn tiến bộ nhanh chóng.",
    },
    {
      icon: <FaTrophy className="feature-icon-element" />,
      title: "Chứng chỉ hoàn thành",
      desc: "Nhận chứng chỉ khi hoàn thành khóa học, tăng giá trị hồ sơ nghề nghiệp của bạn.",
    },
    {
      icon: <FaHeadset className="feature-icon-element" />,
      title: "Hỗ trợ 24/7",
      desc: "Đội ngũ giảng viên tận tâm, sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn.",
    },
  ];

  return (
    <div className="home-page">
      {/* HERO BANNER */}
      <section className="hero-section">
        <div className="hero-gradient-bg"></div>
        <div className="container">
          <div className="hero-wrapper">
            <div className="hero-left">
              <div className="hero-badge">
                <FaRocket style={{ marginRight: "8px" }} />
                Nền tảng học trực tuyến #1 Việt Nam
              </div>
              <h1 className="hero-title">
                Nâng cao kỹ năng,{" "}
                <span className="highlight">mở rộng tương lai</span>
              </h1>
              <p className="hero-subtitle">
                Khám phá hàng ngàn khóa học chất lượng từ các giảng viên hàng
                đầu. Học mọi lúc, mọi nơi với LMS.
              </p>

              <form className="hero-search-form" onSubmit={handleSearch}>
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder="Bạn muốn học gì hôm nay?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-input"
                    id="hero-search-input"
                  />
                </div>
              </form>

              <div className="hero-tags">
                {[
                  "React.js",
                  "Python",
                  "UI/UX Design",
                  "Data Science",
                  "Marketing",
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="hero-tag-btn"
                    onClick={() => navigate(`${ROUTES.SEARCH}?q=${tag}`)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-illustration"></div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY - Stats */}
      <section className="trusted-section">
        <div className="container">
          <div className="trusted-stats stagger-children">
            <div>
              <div className="trusted-stat-number">10K+</div>
              <div className="trusted-stat-label">Học viên đang học</div>
            </div>
            <div>
              <div className="trusted-stat-number">1,000+</div>
              <div className="trusted-stat-label">Khóa học chất lượng</div>
            </div>
            <div>
              <div className="trusted-stat-number">500+</div>
              <div className="trusted-stat-label">Giảng viên uy tín</div>
            </div>
            <div>
              <div className="trusted-stat-number">98%</div>
              <div className="trusted-stat-label">Hài lòng</div>
            </div>
          </div>
        </div>
      </section>

      {/* TOP COURSES SECTION */}
      <section className="courses-section">
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title">Khóa học phổ biến</h2>
              <p className="section-subtitle">
                Các khóa học được yêu thích nhất của chúng tôi
              </p>
            </div>
            <Link to={ROUTES.COURSES} className="view-all-link">
              Xem tất cả
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          <div className="courses-grid stagger-children">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : popularCourses.length > 0
                ? popularCourses
                    .slice(0, 4)
                    .map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))
                : null}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title-block">
            <div>
              <h2 className="section-title">Khám phá danh mục</h2>
              <p className="section-subtitle">
                Tìm khóa học phù hợp với mục tiêu của bạn
              </p>
            </div>
            <Link to={ROUTES.COURSES} className="view-all-link">
              Xem tất cả
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </Link>
          </div>
          <div className="categories-grid stagger-children">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton-box"
                    style={{ height: "80px" }}
                  ></div>
                ))
              : categories.length > 0
                ? categories.map((cat, idx) => {
                    const categoryIcons = [
                      FaLaptop,
                      FaPalette,
                      FaMobileAlt,
                      FaChartBar,
                      FaBook,
                      FaGlobe,
                      FaFilm,
                      FaMusic,
                    ];
                    const IconComponent = categoryIcons[idx % 8];
                    return (
                      <Link
                        key={cat.id}
                        to={`${ROUTES.COURSES}?category=${cat.id}`}
                        className="category-item"
                      >
                        <span className="category-icon">
                          <IconComponent size={24} />
                        </span>
                        <h3 className="category-name">{cat.name}</h3>
                      </Link>
                    );
                  })
                : null}
          </div>
        </div>
      </section>

      {/* FEATURES / WHY US */}
      <section className="features-section">
        <div className="container">
          <div
            className="section-title-block"
            style={{
              justifyContent: "center",
              textAlign: "center",
              marginBottom: "var(--space-12)",
            }}
          >
            <div>
              <h2 className="section-title">Tại sao chọn LMS?</h2>
              <p className="section-subtitle">
                Chúng tôi cam kết mang đến trải nghiệm học tập tốt nhất
              </p>
            </div>
          </div>
          <div className="features-grid stagger-children">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWEST COURSES SECTION */}
      {newestCourses.length > 0 && (
        <section
          className="courses-section"
          style={{ background: "var(--bg-secondary)" }}
        >
          <div className="container">
            <div className="section-title-block">
              <div>
                <h2 className="section-title">Khóa học mới nhất</h2>
                <p className="section-subtitle">
                  Các khóa học vừa được phát hành
                </p>
              </div>
            </div>
            <div className="courses-grid stagger-children">
              {newestCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            Bắt đầu hành trình học tập của bạn ngay hôm nay
          </h2>
          <p className="cta-desc">
            Truy cập hơn 1,000 khóa học và phát triển kỹ năng không giới hạn
          </p>
          <Link to={ROUTES.REGISTER} className="cta-btn">
            Đăng ký miễn phí →
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
