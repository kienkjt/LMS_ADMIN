import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaCheckCircle,
  FaHome,
  FaBook,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { orderService } from '../services/orderService';
import { ROUTES } from '../utils/constants';
import { formatDate, formatPrice } from '../utils/helpers';
import '../pages/OrdersPage.css';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentVerifying, setPaymentVerifying] = useState(true);

  const orderId = searchParams.get('orderId');
  const vnpayCode = searchParams.get('vnp_ResponseCode');
  const transactionId = searchParams.get('vnp_TransactionNo');
  const amount = searchParams.get('vnp_Amount');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setPaymentVerifying(true);

        if (!orderId) {
          toast.error('Thiếu thông tin đơn hàng');
          setPaymentVerifying(false);
          return;
        }

        // Get order details
        const response = await orderService.getOrder(orderId);
        const orderData = response.data?.data || response.data;
        setOrder(orderData);

        // If payment code indicates success and order is still pending, mark as paid
        if (
          vnpayCode === '00' &&
          orderData.status === 'PENDING'
        ) {
          try {
            const payRes = await orderService.payOrder(orderId, {
              transactionId: transactionId || `VNPAY-${Date.now()}`,
            });
            setOrder(payRes.data?.data || payRes.data);
            toast.success('Thanh toán thành công!');
          } catch (payError) {
            console.error('Payment confirmation failed:', payError);
            // Still show success page if order was retrieved
            toast.warning('Đơn hàng đã được tạo. Kiểm tra trạng thái thanh toán.');
          }
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        toast.error('Không thể xác minh thanh toán');
      } finally {
        setPaymentVerifying(false);
        setLoading(false);
      }
    };

    verifyPayment();
  }, [orderId, vnpayCode, transactionId]);

  const isPaymentSuccess = vnpayCode === '00' && order?.status === 'COMPLETED';
  const isPending = order?.status === 'PENDING';

  if (loading || paymentVerifying) {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="spinner"></div>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="status-container">
        {isPaymentSuccess ? (
          <>
            <div className="success-icon">
              <FaCheckCircle size={64} />
            </div>
            <h1>Thanh toán thành công!</h1>
            <p className="status-message">
              Cảm ơn bạn! Đơn hàng của bạn đã được xác nhận và bạn có thể bắt
              đầu học các khóa học ngay lập tức.
            </p>

            {order && (
              <div className="order-summary-compact">
                <div className="summary-item">
                  <label>Mã đơn hàng:</label>
                  <strong>{order.orderCode || order.id}</strong>
                </div>
                <div className="summary-item">
                  <label>Tổng tiền:</label>
                  <strong>{formatPrice(order.totalAmount || 0)}</strong>
                </div>
                <div className="summary-item">
                  <label>Phương thức:</label>
                  <strong>
                    {order.paymentMethod === 'VNPAY' ? 'VNPay' : order.paymentMethod}
                  </strong>
                </div>
                {transactionId && (
                  <div className="summary-item">
                    <label>Mã giao dịch:</label>
                    <strong>{transactionId}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.STUDENT_COURSES)}
              >
                <FaBook /> Bắt đầu học ngay
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(`${ROUTES.STUDENT_ORDERS}`)}
              >
                <FaClock /> Lịch sử đơn hàng
              </button>
            </div>
          </>
        ) : isPending ? (
          <>
            <div className="pending-icon">
              <FaClock size={64} />
            </div>
            <h1>Đơn hàng đang chờ xử lý</h1>
            <p className="status-message">
              Thanh toán của bạn đang được xử lý. Vui lòng chờ xác nhận từ hệ
              thống.
            </p>
            {order && (
              <div className="order-summary-compact">
                <div className="summary-item">
                  <label>Mã đơn hàng:</label>
                  <strong>{order.orderCode || order.id}</strong>
                </div>
                <div className="summary-item">
                  <label>Tổng tiền:</label>
                  <strong>{formatPrice(order.totalAmount || 0)}</strong>
                </div>
              </div>
            )}
            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.STUDENT_ORDERS)}
              >
                <FaClock /> Kiểm tra trạng thái
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(ROUTES.HOME)}
              >
                <FaHome /> Trang chủ
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="warning-icon">
              <FaExclamationTriangle size={64} />
            </div>
            <h1>Không xác định trạng thái thanh toán</h1>
            <p className="status-message">
              Vui lòng kiểm tra lịch sử đơn hàng để xác nhận thanh toán hoặc
              liên hệ hỗ trợ.
            </p>
            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.STUDENT_ORDERS)}
              >
                <FaClock /> Lịch sử đơn hàng
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(ROUTES.HOME)}
              >
                <FaHome /> Trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
