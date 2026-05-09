import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { wishlistService } from "../services/wishlistService";
import { ROUTES } from "../utils/constants";
import { formatDate, formatPrice } from "../utils/helpers";
import "./WishlistPage.css";

const WishListPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistService.getWishlist();
        setItems(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        toast.error("Khong the tai danh sach yeu thich");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (courseId) => {
    try {
      setRemovingId(courseId);
      await wishlistService.remove(courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
      toast.success("Da xoa khoi danh sach yeu thich");
    } catch (error) {
      console.error("Remove wishlist item failed:", error);
      toast.error(
        error.response?.data?.message || "Khong the xoa khoi yeu thich",
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="wishlist-page animate-fade-in">
      <div className="wishlist-header">
        <h1>Danh sach yeu thich</h1>
        <p>Luu lai cac khoa hoc ban quan tam de hoc sau.</p>
      </div>

      {loading ? (
        <div className="wishlist-state">Dang tai danh sach...</div>
      ) : items.length === 0 ? (
        <div className="wishlist-empty">
          <h3>Chua co khoa hoc nao trong danh sach yeu thich</h3>
          <p>Ban co the them khoa hoc yeu thich tu trang chi tiet khoa hoc.</p>
          <Link to={ROUTES.COURSES} className="btn btn-primary btn-sm">
            Kham pha khoa hoc
          </Link>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => (
            <article key={item.id} className="wishlist-item">
              <div className="wishlist-item-thumbnail">
                {item.course?.thumbnail || item.course?.image ? (
                  <img
                    src={item.course.thumbnail || item.course.image}
                    alt={item.course?.title || "Course"}
                  />
                ) : (
                  <div className="wishlist-item-placeholder">No Image</div>
                )}
              </div>

              <div className="wishlist-item-content">
                <h3>{item.course?.title || "Khoa hoc"}</h3>
                <p>
                  {item.course?.shortDescription ||
                    item.course?.description ||
                    ""}
                </p>
                <div className="wishlist-item-meta">
                  <span>{formatPrice(item.course?.price || 0)}</span>
                  <span>Them ngay: {formatDate(item.addedAt)}</span>
                </div>
              </div>

              <div className="wishlist-item-actions">
                <Link
                  to={`/courses/${item.course?.slug || item.courseId}`}
                  className="btn btn-outline btn-sm"
                >
                  Xem chi tiet
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(item.courseId)}
                  disabled={removingId === item.courseId}
                >
                  Xoa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishListPage;
