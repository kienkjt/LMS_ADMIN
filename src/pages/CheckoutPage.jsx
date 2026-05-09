import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";
import { userService } from "../services/userService";
import vnpayService from "../services/vnpayService";
import { ROUTES } from "../utils/constants";
import Loading from "../components/common/Loading";
import {
  FaShoppingCart,
  FaTrash,
  FaArrowLeft,
  FaCreditCard,
  FaBuilding,
  FaMoneyBillWave,
  FaCheck,
} from "react-icons/fa";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("VNPAY");
  const [note, setNote] = useState("");
  const [orderCreated, setOrderCreated] = useState(null);

  // Load cart and profile
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [cartRes, profileRes] = await Promise.all([
          cartService.getCart(),
          userService.getProfile(),
        ]);

        setCartItems(cartRes.data?.items || cartRes.data || []);
        setProfile(profileRes.data);
      } catch (error) {
        toast.error("Lỗi tải giỏ hàng");
        console.error("Error loading checkout data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate total
  const calculateTotal = () => {
    return (cartItems || []).reduce((sum, item) => {
      const price =
        item.paidPrice || item.course?.discountPrice || item.course?.price || 0;
      return sum + price;
    }, 0);
  };

  const total = calculateTotal();

  // Handle checkout
  const handleCheckout = async () => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    try {
      setProcessing(true);

      // Step 1: Create order
      const orderRes = await orderService.checkout({
        paymentMethod,
        note,
      });

      const order = orderRes.data;
      setOrderCreated(order);

      // Step 2: Handle payment based on method
      if (paymentMethod === "FREE") {
        // For free orders, mark as completed immediately
        await orderService.payOrder(order.id, {
          transactionId: "FREE_ORDER",
        });

        toast.success("Đơn hàng tạo thành công!");
        // Navigate to order confirmation
        setTimeout(() => {
          navigate(`/order/${order.id}`, { state: { orderData: order } });
        }, 1000);
      } else if (paymentMethod === "VNPAY") {
        // VNPAY Payment Gateway
        try {
          const paymentUrl = vnpayService.generatePaymentUrl({
            orderId: order.id,
            amount: total,
            orderCode: order.orderCode,
            description: `Thanh toán khóa học - Đơn hàng ${order.orderCode}`,
            buyerEmail: profile?.email,
            buyerPhone: profile?.phoneNumber,
          });

          // Redirect to VNPAY payment gateway
          // Note: The success/failure callback will be handled by PaymentSuccessPage/PaymentFailurePage
          window.location.href = paymentUrl;
        } catch (vnpayError) {
          console.error("VNPAY Error:", vnpayError);
          toast.error("Lỗi khởi tạo thanh toán VNPAY");
        }
      } else if (paymentMethod === "BANK_TRANSFER") {
        // Bank Transfer - show pending page
        toast.info("Vui lòng chuyển khoản theo thông tin ngân hàng");
        
        // Navigate to pending payment page
        navigate(`/payment/pending?orderId=${order.id}`, {
          state: { orderData: order },
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMsg = error.response?.data?.message || "Lỗi tạo đơn hàng";
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="checkout-container empty-cart">
        <div className="empty-state">
          <FaShoppingCart size={48} />
          <h2>Giỏ hàng trống</h2>
          <p>Hãy thêm khóa học vào giỏ hàng trước khi thanh toán</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate(ROUTES.COURSES)}
          >
            <FaArrowLeft /> Quay lại khóa học
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-back" onClick={() => navigate(ROUTES.CART)}>
          <FaArrowLeft /> Quay lại giỏ hàng
        </button>
        <h1>Thanh toán</h1>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="checkout-section order-summary">
          <h2>Tóm tắt đơn hàng</h2>
          <div className="cart-items-summary">
            {cartItems.map((item) => (
              <div key={item.id || item.courseId} className="cart-item">
                <div className="item-info">
                  <h3>
                    {item.course?.title || item.courseTitle || "Khóa học"}
                  </h3>
                  {item.course?.instructorName && (
                    <p className="instructor">
                      Giảng viên: {item.course.instructorName}
                    </p>
                  )}
                </div>
                <div className="item-price">
                  {item.paidPrice ||
                  item.course?.discountPrice ||
                  item.course?.price
                    ? `${(
                        item.paidPrice ||
                        item.course?.discountPrice ||
                        item.course?.price
                      ).toLocaleString("vi-VN")} ₫`
                    : "Miễn phí"}
                </div>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="price-row">
              <span>Tổng phụ:</span>
              <span>{total.toLocaleString("vi-VN")} ₫</span>
            </div>
            <div className="price-row tax">
              <span>Phí:</span>
              <span>0 ₫</span>
            </div>
            <div className="price-row total">
              <span>Tổng cộng:</span>
              <strong>{total.toLocaleString("vi-VN")} ₫</strong>
            </div>
          </div>
        </div>

        {/* Billing Information */}
        <div className="checkout-section billing-info">
          <h2>Thông tin thanh toán</h2>
          {profile && (
            <div className="profile-info">
              <div className="info-row">
                <label>Họ tên:</label>
                <span>{profile.fullName}</span>
              </div>
              <div className="info-row">
                <label>Email:</label>
                <span>{profile.email}</span>
              </div>
              {profile.phoneNumber && (
                <div className="info-row">
                  <label>Điện thoại:</label>
                  <span>{profile.phoneNumber}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="checkout-section payment-methods">
          <h2>Phương thức thanh toán</h2>
          <div className="methods-list">
            <label className="method-option">
              <input
                type="radio"
                name="payment"
                value="VNPAY"
                checked={paymentMethod === "VNPAY"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <FaCreditCard /> VNPay
                <span className="badge">Khuyến nghị</span>
              </div>
            </label>

            <label className="method-option">
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={paymentMethod === "BANK_TRANSFER"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <div className="method-content">
                <FaBuilding /> Chuyển khoản ngân hàng
              </div>
            </label>

            {total === 0 && (
              <label className="method-option">
                <input
                  type="radio"
                  name="payment"
                  value="FREE"
                  checked={paymentMethod === "FREE"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <FaMoneyBillWave /> Miễn phí
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="checkout-section notes">
          <h2>Ghi chú (tùy chọn)</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Thêm ghi chú cho đơn hàng..."
            rows={4}
          />
        </div>

        {/* Terms */}
        <div className="checkout-section terms">
          <label className="checkbox">
            <input type="checkbox" required />
            Tôi đồng ý với <a href="#terms">Điều khoản và Điều kiện</a>
          </label>
        </div>

        {/* CTA */}
        <div className="checkout-actions">
          <button
            className="btn btn-secondary"
            onClick={() => navigate(ROUTES.CART)}
            disabled={processing}
          >
            Quay lại
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleCheckout}
            disabled={processing || !cartItems.length}
          >
            {processing ? (
              <>
                <span className="spinner"></span> Đang xử lý...
              </>
            ) : (
              <>
                <FaCheck /> Hoàn tất thanh toán ({total.toLocaleString("vi-VN")}{" "}
                ₫)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
