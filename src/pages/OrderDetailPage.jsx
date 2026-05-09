import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaDownload,
  FaHome,
  FaBook,
  FaCopy,
  FaClock,
} from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { ROUTES } from '../utils/constants';
import { formatDate, formatPrice } from '../utils/helpers';
import './OrdersPage.css';

const OrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);
        
        // Try to get order from location state first
        if (location.state?.orderData) {
          setOrder(location.state.orderData);
          return;
        }

        // Otherwise fetch from API
        const response = await orderService.getOrder(orderId);
        setOrder(response.data?.data || response.data);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Không thể tải chi tiết đơn hàng');
        navigate(ROUTES.STUDENT_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, location.state, navigate]);

  const handleCopyOrderId = () => {
    if (order?.orderCode || order?.id) {
      navigator.clipboard.writeText(order.orderCode || order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info('Đã sao chép mã đơn hàng');
    }
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải chi tiết đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-error">
        <h2>Không tìm thấy đơn hàng</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate(ROUTES.STUDENT_ORDERS)}
        >
          Quay lại lịch sử đơn hàng
        </button>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <div className="order-detail-header">
        <div className="order-detail-title">
          {order.status === 'COMPLETED' ? (
            <>
              <FaCheckCircle className="success-icon" size={32} />
              <div>
                <h1>Đơn hàng của bạn đã được xác nhận</h1>
                <p>Cảm ơn đã mua hàng! Bây giờ bạn có thể truy cập các khóa học.</p>
              </div>
            </>
          ) : order.status === 'PENDING' ? (
            <>
              <FaClock className="pending-icon" size={32} />
              <div>
                <h1>Đơn hàng đang chờ thanh toán</h1>
                <p>Vui lòng hoàn tất thanh toán để truy cập khóa học.</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1>Chi tiết đơn hàng</h1>
                <p>Mã đơn: {order.orderCode || order.id}</p>
              </div>
            </>
          )}
        </div>
        
        <div className="order-detail-actions">
          <button
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <FaHome /> Trang chủ
          </button>
          <button
            className="btn btn-outline"
            onClick={() => navigate(ROUTES.STUDENT_COURSES)}
          >
            <FaBook /> Khóa học của tôi
          </button>
        </div>
      </div>

      <div className="order-detail-content">
        {/* Order Information */}
        <div className="detail-section order-info">
          <h2>Thông tin đơn hàng</h2>
          
          <div className="info-grid">
            <div className="info-item">
              <label>Mã đơn hàng:</label>
              <div className="info-value-with-action">
                <span>{order.orderCode || order.id}</span>
                <button
                  className="btn-copy"
                  onClick={handleCopyOrderId}
                  title={copied ? 'Đã sao chép' : 'Sao chép mã đơn hàng'}
                >
                  <FaCopy /> {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            <div className="info-item">
              <label>Ngày tạo:</label>
              <span>{formatDate(order.createdAt)}</span>
            </div>

            <div className="info-item">
              <label>Trạng thái:</label>
              <span className={`status-badge ${order.status?.toLowerCase()}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <div className="info-item">
              <label>Phương thức thanh toán:</label>
              <span>{getPaymentMethodLabel(order.paymentMethod)}</span>
            </div>

            {order.transactionId && (
              <div className="info-item">
                <label>Mã giao dịch:</label>
                <span>{order.transactionId}</span>
              </div>
            )}

            {order.paidAt && (
              <div className="info-item">
                <label>Thời gian thanh toán:</label>
                <span>{formatDate(order.paidAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="detail-section order-items-section">
          <h2>Khóa học ({order.items?.length || 0})</h2>
          
          <div className="order-items-list">
            {order.items && order.items.length > 0 ? (
              order.items.map((item) => (
                <div key={item.id || item.courseId} className="order-item-detail">
                  <div className="item-thumbnail">
                    {item.courseThumbnail && (
                      <img
                        src={item.courseThumbnail}
                        alt={item.courseTitle}
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/120x80?text=Course';
                        }}
                      />
                    )}
                  </div>
                  <div className="item-info">
                    <h4>{item.courseTitle || 'Khóa học'}</h4>
                    {item.courseInstructor && (
                      <p className="instructor">Giảng viên: {item.courseInstructor}</p>
                    )}
                  </div>
                  <div className="item-price">
                    {formatPrice(item.paidPrice || 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-items">
                <p>Không có khóa học nào trong đơn hàng này</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="detail-section order-summary-section">
          <h2>Tóm tắt thanh toán</h2>
          
          <div className="summary-table">
            <div className="summary-row">
              <span className="label">Tổng phụ:</span>
              <span className="value">{formatPrice(order.totalAmount || 0)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Phí:</span>
              <span className="value">0 ₫</span>
            </div>
            <div className="summary-row">
              <span className="label">Chiết khấu:</span>
              <span className="value">-0 ₫</span>
            </div>
            <div className="summary-row total">
              <span className="label">Tổng cộng:</span>
              <span className="value">{formatPrice(order.totalAmount || 0)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="detail-section detail-actions">
          <button className="btn btn-outline" onClick={() => window.print()}>
            <FaDownload /> In đơn hàng
          </button>
          <button
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.STUDENT_COURSES)}
          >
            <FaBook /> Bắt đầu học ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getStatusLabel = (status) => {
  const statusMap = {
    PENDING: 'Chờ thanh toán',
    COMPLETED: 'Đã thanh toán',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };
  return statusMap[status] || status;
};

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    VNPAY: 'VNPay',
    BANK_TRANSFER: 'Chuyển khoản ngân hàng',
    PAYPAL: 'PayPal',
    WALLET: 'Ví điện tử',
    FREE: 'Miễn phí',
  };
  return methodMap[method] || method;
};

export default OrderDetailPage;
