import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaClock,
  FaCoins,
  FaHistory,
  FaListAlt,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";
import { orderService } from "../services/orderService";
import { ORDER_STATUS, ROUTES } from "../utils/constants";
import { formatDate, formatPrice } from "../utils/helpers";
import "./OrdersPage.css";

const PAGE_SIZE = 10;

const ORDER_STATUS_META = {
  [ORDER_STATUS.PENDING]: {
    label: "Đang chờ thanh toán",
    className: "pending",
  },
  [ORDER_STATUS.COMPLETED]: {
    label: "Đã thanh toán",
    className: "completed",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Đã hủy",
    className: "cancelled",
  },
  [ORDER_STATUS.REFUNDED]: {
    label: "Đã hoàn tiền",
    className: "refunded",
  },
};

const normalizeOrders = (payload) => {
  if (Array.isArray(payload)) {
    return {
      content: payload,
      totalElements: payload.length,
    };
  }

  return {
    content: Array.isArray(payload?.content) ? payload.content : [],
    totalElements: payload?.totalElements || 0,
  };
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderService.getMyOrders({
          page,
          size: PAGE_SIZE,
        });
        const normalized = normalizeOrders(response.data);
        setOrders(normalized.content);
        setTotalElements(normalized.totalElements);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        toast.error("Không thể tải lịch sử đơn hàng");
        setOrders([]);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page]);

  const stats = useMemo(() => {
    const pending = orders.filter(
      (order) => order.status === ORDER_STATUS.PENDING,
    ).length;
    const completed = orders.filter(
      (order) => order.status === ORDER_STATUS.COMPLETED,
    ).length;

    return {
      total: totalElements,
      pending,
      completed,
    };
  }, [orders, totalElements]);

  const handleCancel = async (order) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn hủy đơn ${order.orderCode || order.id}?`,
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(order.id);
      const response = await orderService.cancelOrder(order.id);
      const updated = response.data || {};
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, ...updated } : item,
        ),
      );
      toast.success("Hủy đơn hàng thành công");
    } catch (error) {
      console.error("Cancel order failed:", error);
      toast.error(error.response?.data?.message || "Không thể hủy đơn hàng");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRefund = async (order) => {
    if (
      !window.confirm(
        `Bạn chắc chắn muốn yêu cầu hoàn tiền đơn ${order.orderCode || order.id}?`,
      )
    ) {
      return;
    }

    try {
      setActionLoadingId(order.id);
      const response = await orderService.refundOrder(order.id);
      const updated = response.data || {};
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, ...updated } : item,
        ),
      );
      toast.success("Yêu cầu hoàn tiền thành công");
    } catch (error) {
      console.error("Refund order failed:", error);
      toast.error(
        error.response?.data?.message || "Không thể hoàn tiền đơn hàng",
      );
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="orders-page animate-fade-in">
      <div className="orders-header">
        <div>
          <h1>
            <FaHistory /> Lịch sử đơn hàng
          </h1>
          <p>Theo dõi thanh toán, trạng thái và các khóa học đã mua.</p>
        </div>
        <Link to={ROUTES.COURSES} className="btn btn-outline btn-sm">
          Khám phá khóa học
        </Link>
      </div>

      <div className="orders-stats">
        <div className="orders-stat-card">
          <div className="orders-stat-title">Tổng đơn</div>
          <div className="orders-stat-value">{stats.total}</div>
        </div>
        <div className="orders-stat-card pending">
          <div className="orders-stat-title">Chờ thanh toán</div>
          <div className="orders-stat-value">{stats.pending}</div>
        </div>
        <div className="orders-stat-card completed">
          <div className="orders-stat-title">Đã thanh toán</div>
          <div className="orders-stat-value">{stats.completed}</div>
        </div>
      </div>

      {loading ? (
        <div className="orders-loading">Đang tải lịch sử đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <FaListAlt size={44} />
          <h3>Bạn chưa có đơn hàng nào</h3>
          <p>Hãy thêm khóa học vào giỏ và tiến hành thanh toán.</p>
          <Link to={ROUTES.COURSES} className="btn btn-primary btn-sm">
            Đi đến danh sách khóa học
          </Link>
        </div>
      ) : (
        <>
          <div className="orders-list">
            {orders.map((order) => {
              const statusMeta = ORDER_STATUS_META[order.status] || {
                label: order.status || "Không rõ",
                className: "pending",
              };

              return (
                <article key={order.id} className="order-card">
                  <header className="order-card-header">
                    <div>
                      <h3>{order.orderCode || order.id}</h3>
                      <p>
                        <FaClock /> {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`order-status ${statusMeta.className}`}>
                      {statusMeta.label}
                    </span>
                  </header>

                  <div className="order-summary-row">
                    <div className="order-summary-item">
                      <span className="label">Tổng tiền</span>
                      <strong>
                        <FaCoins /> {formatPrice(order.totalAmount || 0)}
                      </strong>
                    </div>
                    <div className="order-summary-item">
                      <span className="label">Phương thức</span>
                      <strong>{order.paymentMethod || "-"}</strong>
                    </div>
                    <div className="order-summary-item">
                      <span className="label">Số khóa học</span>
                      <strong>{order.items?.length || 0}</strong>
                    </div>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 && (
                    <div className="order-items">
                      {order.items.map((item) => (
                        <div
                          key={item.id || item.courseId}
                          className="order-item-row"
                        >
                          <span className="title">
                            {item.courseTitle || "Khóa học"}
                          </span>
                          <span className="price">
                            {formatPrice(item.paidPrice || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <footer className="order-actions">
                    {order.status === ORDER_STATUS.PENDING && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancel(order)}
                        disabled={actionLoadingId === order.id}
                      >
                        <FaTimesCircle /> Hủy đơn
                      </button>
                    )}

                    {order.status === ORDER_STATUS.COMPLETED && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRefund(order)}
                        disabled={actionLoadingId === order.id}
                      >
                        <FaUndo /> Hoàn tiền
                      </button>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>

          <div className="orders-pagination">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page <= 0}
            >
              Trang trước
            </button>
            <span>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              className="btn btn-outline btn-sm"
              onClick={() =>
                setPage((prev) => Math.min(totalPages - 1, prev + 1))
              }
              disabled={page >= totalPages - 1}
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default OrdersPage;
