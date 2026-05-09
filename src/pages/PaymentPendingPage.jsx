import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaHome, FaTimesCircle } from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { ROUTES } from '../utils/constants';
import '../pages/OrdersPage.css';

const PaymentPendingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkStatus, setCheckStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        if (!orderId) {
          setStatusMessage('Thiếu thông tin đơn hàng');
          return;
        }

        const response = await orderService.getOrder(orderId);
        const orderData = response.data?.data || response.data;
        setOrder(orderData);

        // If order is already completed, redirect
        if (orderData?.status === 'COMPLETED') {
          setTimeout(() => {
            navigate(`/order/${orderId}`);
          }, 2000);
        }
      } catch (error) {
        console.error('Error loading order:', error);
        setStatusMessage('Không thể tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, navigate]);

  const handleCheckStatus = async () => {
    try {
      setCheckStatus(true);
      const response = await orderService.getOrder(orderId);
      const orderData = response.data?.data || response.data;
      setOrder(orderData);

      if (orderData?.status === 'COMPLETED') {
        setStatusMessage('Thanh toán đã được xác nhận!');
        setTimeout(() => {
          navigate(`/order/${orderId}`);
        }, 2000);
      } else if (orderData?.status === 'CANCELLED') {
        setStatusMessage('Đơn hàng đã bị hủy');
      } else {
        setStatusMessage('Đơn hàng vẫn đang xử lý, vui lòng thử lại sau');
      }
    } catch (error) {
      console.error('Error checking status:', error);
      setStatusMessage('Không thể kiểm tra trạng thái');
    } finally {
      setCheckStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="spinner"></div>
          <h2>Đang tải thông tin...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="status-container">
        <div className="pending-icon animate-pulse">
          <FaClock size={64} />
        </div>

        <h1>Thanh toán đang xử lý</h1>

        <p className="status-message">
          Đơn hàng của bạn đang được xử lý. Vui lòng đợi xác nhận từ hệ thống.
          Điều này có thể mất vài phút.
        </p>

        {order && (
          <div className="order-summary-compact">
            <div className="summary-item">
              <label>Mã đơn hàng:</label>
              <strong>{order.orderCode || order.id}</strong>
            </div>
            <div className="summary-item">
              <label>Trạng thái:</label>
              <strong>{getStatusLabel(order.status)}</strong>
            </div>
            <div className="summary-item">
              <label>Phương thức:</label>
              <strong>{order.paymentMethod || '-'}</strong>
            </div>
          </div>
        )}

        {statusMessage && (
          <div className={`status-message-box ${getMessageType(statusMessage)}`}>
            {getMessageType(statusMessage) === 'success' && (
              <FaCheckCircle size={20} />
            )}
            {getMessageType(statusMessage) === 'error' && (
              <FaTimesCircle size={20} />
            )}
            <span>{statusMessage}</span>
          </div>
        )}

        <div className="action-buttons">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCheckStatus}
            disabled={checkStatus}
          >
            {checkStatus ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}
          </button>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate(ROUTES.STUDENT_ORDERS)}
          >
            Lịch sử đơn hàng
          </button>
        </div>

        <div className="pending-info">
          <p>
            <strong>Mẹo:</strong> Bạn có thể đóng trang này. Hệ thống sẽ cập
            nhật trạng thái tự động khi thanh toán hoàn tất.
          </p>
        </div>
      </div>
    </div>
  );
};

const getStatusLabel = (status) => {
  const statusMap = {
    PENDING: 'Chờ thanh toán',
    COMPLETED: 'Đã thanh toán',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
  };
  return statusMap[status] || status;
};

const getMessageType = (message) => {
  if (message.includes('xác nhận')) return 'success';
  if (message.includes('lỗi') || message.includes('hủy')) return 'error';
  return 'info';
};

export default PaymentPendingPage;
