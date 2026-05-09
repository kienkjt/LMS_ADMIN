import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import "./CategoryFilter.css";

const CategoryFilter = ({
  categories,
  selectedCategory,
  onCategoryChange,
  loading,
  error,
  onRetry,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories based on search term
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Get selected category name
  const selectedName =
    categories.find((c) => c.id === selectedCategory)?.name ||
    "Tất cả danh mục";

  if (loading) {
    return (
      <div className="category-filter-wrapper">
        <div className="category-select category-select-loading">
          <div
            className="skeleton"
            style={{ height: "40px", borderRadius: "6px" }}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-filter-wrapper">
        <div className="category-error">
          <p>{error}</p>
          <button className="btn btn-sm btn-outline" onClick={onRetry}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-filter-wrapper">
      <div className="category-select-container">
        <label className="category-label">Danh mục</label>
        <div className="category-select" onClick={() => setIsOpen(!isOpen)}>
          <span className="select-value">
            {selectedCategory ? selectedName : "Tất cả danh mục"}
          </span>
          <FaChevronDown className={`select-icon ${isOpen ? "open" : ""}`} />
        </div>

        {isOpen && (
          <div className="category-dropdown">
            {/* Search box nếu danh mục >= 8 */}
            {categories.length >= 8 && (
              <div className="dropdown-search">
                <input
                  type="text"
                  placeholder="Tìm danh mục..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="search-input"
                />
              </div>
            )}

            {/* Options list */}
            <div className="dropdown-options">
              {/* "Tất cả" option */}
              <div
                className={`dropdown-option ${!selectedCategory ? "active" : ""}`}
                onClick={() => {
                  onCategoryChange("");
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <span>Tất cả danh mục</span>
              </div>

              {/* Category options */}
              {filteredCategories.length > 0 ? (
                filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`dropdown-option ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => {
                      onCategoryChange(cat.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <span>{cat.name}</span>
                  </div>
                ))
              ) : (
                <div className="dropdown-option disabled">
                  Không tìm thấy danh mục
                </div>
              )}
            </div>
          </div>
        )}

        {/* Overlay để đóng dropdown khi click outside */}
        {isOpen && (
          <div
            className="dropdown-overlay"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm("");
            }}
          />
        )}
      </div>

      {/* Show selected category tag nếu có*/}
      {selectedCategory && (
        <div className="selected-category-tag">
          <span>{selectedName}</span>
          <button
            className="clear-btn"
            onClick={() => onCategoryChange("")}
            title="Xóa bộ lọc"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;
