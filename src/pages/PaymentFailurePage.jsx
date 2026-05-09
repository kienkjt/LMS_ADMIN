import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaTimesCircle,
  FaHome,
  FaArrowLeft,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { ROUTES } from '../utils/constants';
import '../pages/OrdersPage.css';

const PaymentFailurePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const vnpayCode = searchParams.get('vnp_ResponseCode');
  const vnpayMessage = searchParams.get('vnp_Message');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        if (orderId) {
          const response = await orderService.getOrder(orderId);
          setOrder(response.data?.data || response.data);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const handleRetryPayment = () => {
    if (order) {
      navigate(ROUTES.CHECKOUT, { state: { orderId: order.id } });
    } else {
      navigate(ROUTES.CART);
    }
  };

  const getErrorMessage = () => {
    const codeMessages = {
      '07': 'Merchant Synthesize Transaction Submitted',
      '09': 'Bank Declined Transaction',
      '10': 'Incorrect Checksum',
      '11': 'Merchant Account Not Yet Confirmed by VNPay',
      '12': 'Merchant Lock Status - Cannot Process Transaction',
      '13': 'Unsupported Currency',
      '24': 'Customer Cancel Transaction',
      '25': 'Invalid Request',
      '51': 'Insufficient Account Balance',
      '65': 'Merchant Account Status Invalid',
      '75': 'Payment Gateway Timeout',
      '79': 'Unidentified Error',
      '99': 'Unknown Error',
    };

    return (
      codeMessages[vnpayCode] ||
      vnpayMessage ||
      'Thanh toán không thành công. Vui lòng thử lại'
    );
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
        <div className="error-icon">
          <FaTimesCircle size={64} />
        </div>

        <h1>Thanh toán không thành công</h1>

        <div className="error-details">
          <p className="error-message">{getErrorMessage()}</p>

          {vnpayCode && (
            <div className="error-code">
              <small>Mã lỗi: {vnpayCode}</small>
            </div>
          )}

          {order && (
            <div className="order-info-compact">
              <p>
                <strong>Mã đơn hàng:</strong> {order.orderCode || order.id}
              </p>
              <p>
                <strong>Trạng thái:</strong> {getStatusLabel(order.status)}
              </p>
            </div>
          )}
        </div>

        <div className="error-suggestions">
          <h3>
            <FaExclamationTriangle /> Nguyên nhân có thể là:
          </h3>
          <ul>
            <li>Số tài khoản ngân hàng không chính xác</li>
            <li>Tài khoản không đủ số dư</li>
            <li>Thẻ/tài khoản bị khóa hoặc hết hạn</li>
            <li>Kết nối mạng bị gián đoạn</li>
            <li>Thời gian chế độ offline quá lâu</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleRetryPayment}
          >
            <FaArrowLeft /> Thử lại thanh toán
          </button>
          <button
            className="btn btn-outline btn-lg"
            onClick={() => navigate(ROUTES.HOME)}
          >
            <FaHome /> Trang chủ
          </button>
        </div>

        <div className="support-info">
          <p>
            Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ khách
            hàng.
          </p>
          <a href="mailto:support@lms.com" className="support-link">
            Liên hệ hỗ trợ
          </a>
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

export default PaymentFailurePage;
