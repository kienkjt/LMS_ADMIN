import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiBell, FiCheck, FiRefreshCw } from "react-icons/fi";
import { notificationService } from "../../services/notificationService";
import "./NotificationCenter.css";

const toList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.notifications)) return payload.notifications;
  return [];
};

const normalizeNotifications = (payload) => {
  const list = toList(payload);

  return list.map((item, index) => ({
    id: item.id || item.notificationId || `temp-${index}`,
    title: item.title || item.subject || "Thông báo",
    message: item.message || item.content || item.description || "",
    createdAt:
      item.createdAt || item.timestamp || item.sentAt || item.updatedAt || null,
    isRead: Boolean(item.read ?? item.isRead ?? item.readStatus === "READ"),
  }));
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) return "Vừa xong";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return date.toLocaleDateString("vi-VN");
};

const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [hasLoaded, setHasLoaded] = useState(false);

  const containerRef = useRef(null);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications],
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await notificationService.getAll();
      const payload = response.data?.data || response.data;
      setNotifications(normalizeNotifications(payload));
      setHasLoaded(true);
    } catch (fetchError) {
      console.error("Failed to fetch notifications:", fetchError);
      setError("Không thể tải thông báo");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen && !hasLoaded) {
      fetchNotifications();
    }
  };

  const handleMarkRead = async (notificationId) => {
    if (String(notificationId).startsWith("temp-")) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
      return;
    }

    try {
      await notificationService.markRead(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    } catch (markError) {
      console.error("Failed to mark notification as read:", markError);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((notification) => !notification.isRead);
    if (unread.length === 0) return;

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );

    const validUnreadIds = unread
      .filter((notification) => !String(notification.id).startsWith("temp-"))
      .map((notification) => notification.id);

    if (validUnreadIds.length > 0) {
      await Promise.allSettled(
        validUnreadIds.map((notificationId) =>
          notificationService.markRead(notificationId),
        ),
      );
    }
  };

  return (
    <div className="notification-center" ref={containerRef}>
      <button
        className="notification-trigger"
        onClick={handleToggle}
        aria-label="Mở thông báo"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notification-dropdown animate-scale-in">
          <div className="notification-header">
            <h4>Thông báo</h4>
            <div className="notification-header-actions">
              <button
                className="notification-action-btn"
                onClick={fetchNotifications}
                disabled={loading}
                title="Tải lại"
              >
                <FiRefreshCw size={14} />
              </button>
              <button
                className="notification-action-btn"
                onClick={handleMarkAllRead}
                title="Đánh dấu đã đọc"
              >
                <FiCheck size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="notification-state">Đang tải thông báo...</div>
          ) : error ? (
            <div className="notification-state error">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="notification-state">Chưa có thông báo nào</div>
          ) : (
            <div className="notification-list">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? "read" : "unread"}`}
                  onClick={() => handleMarkRead(notification.id)}
                >
                  <div className="notification-item-title-row">
                    <span className="notification-item-title">
                      {notification.title}
                    </span>
                    {!notification.isRead && (
                      <span className="notification-item-dot" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="notification-item-message">
                      {notification.message}
                    </p>
                  )}
                  {notification.createdAt && (
                    <span className="notification-item-time">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
