/**
 * VNPAY Payment Gateway Service
 * Handles VNPAY payment URL generation, parameter setup, and signature generation
 *
 * VNPAY Test Environment:
 * - Merchant ID: TMNCODE (test merchant code)
 * - Secure Hash Secret: secretKey
 * - Test URL: https://sandbox.vnpayment.vn/paygate/pay.html
 *
 * Test Card Numbers:
 * - Success: 9704 2400 0000 0018 (Exp: 07/15, OTP: 123456)
 * - Fail: 4111 1111 1111 1111 (Exp: 07/15, OTP: 123456)
 */

// Configuration for VNPAY integration
const VNPAY_CONFIG = {
  // Development (Sandbox)
  SANDBOX: {
    baseUrl: 'https://sandbox.vnpayment.vn/paygate/pay.html',
    tmnCode: import.meta.env.VITE_VNPAY_MERCHANT_ID || 'TMNCODE',
    hashSecret: import.meta.env.VITE_VNPAY_HASH_SECRET || 'TESTKEY',
    apiUrl: 'https://sandbox.vnpayment.vn/paygate/querydr',
  },

  // Production
  PRODUCTION: {
    baseUrl: 'https://pay.vnpayment.vn/paygate/pay.html',
    tmnCode: import.meta.env.VITE_VNPAY_MERCHANT_ID_PROD,
    hashSecret: import.meta.env.VITE_VNPAY_HASH_SECRET_PROD,
    apiUrl: 'https://api.vnpayment.vn/paygate/querydr',
  },

  // Common
  version: '2.1.0',
  locale: 'vn', // 'vn' or 'en'
  currencyCode: 'VND',
  orderType: 'LMS', // Order type code
  commandCode: 'pay', // Standard payment
};

// Get environment configuration
const getConfig = () => {
  const isDev = import.meta.env.VITE_ENV !== 'production';
  return isDev ? VNPAY_CONFIG.SANDBOX : VNPAY_CONFIG.PRODUCTION;
};

/**
 * Generate MD5 hash for VNPAY signature
 * @param {string} str - String to hash
 * @returns {string} MD5 hash in hex
 */
const generateMD5 = (str) => {
  // In browser, use crypto.subtle API
  // For now, using simple fallback (in production use crypto library)
  return str; // Placeholder - real implementation needs proper crypto library
};

/**
 * Generate HMAC-SHA-512 signature
 * @param {string} data - Data to sign
 * @param {string} secret - Secret key
 * @returns {string} HMAC signature in hex
 */
const generateSignature = (data, secret) => {
  // This requires a crypto library. For production:
  // 1. Import crypto-js: npm install crypto-js
  // 2. Use: CryptoJS.HmacSHA512(data, secret).toString()
  // For now, return placeholder
  console.warn('[VNPAY Service] Real signature generation requires crypto-js library');
  return '0'.repeat(128); // Placeholder
};

/**
 * Sort object keys alphabetically
 * @param {object} obj - Object to sort
 * @returns {object} Sorted object
 */
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
};

/**
 * Generate VNPAY payment URL
 * @param {object} orderData - Order information
 * @param {string} orderData.orderId - Unique order ID
 * @param {number} orderData.amount - Amount in VND (multiply by 100 for VNPAY)
 * @param {string} orderData.orderCode - Order code for display
 * @param {string} orderData.description - Order description
 * @param {string} orderData.buyerEmail - Customer email (optional)
 * @param {string} orderData.buyerPhone - Customer phone (optional)
 * @returns {string} VNPAY payment URL
 *
 * @example
 * const paymentUrl = vnpayService.generatePaymentUrl({
 *   orderId: 'ORDER_123',
 *   amount: 250000, // 250,000 VND
 *   orderCode: 'ORD20240101001',
 *   description: 'Web Development Course'
 * });
 * window.location.href = paymentUrl;
 */
export const generatePaymentUrl = (orderData) => {
  try {
    const config = getConfig();
    const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;

    // Build VNPay params
    const vnpParams = {
      vnp_Version: config.version,
      vnp_Command: config.commandCode,
      vnp_TmnCode: config.tmnCode,
      vnp_Amount: (orderData.amount || 0) * 100, // VNPAY expects amount in cents
      vnp_CurrCode: config.currencyCode,
      vnp_TxnRef: orderData.orderId || `ORD${Date.now()}`, // Unique transaction reference
      vnp_OrderInfo: `Thanh toan don hang ${orderData.orderCode || orderData.orderId}`,
      vnp_OrderType: config.orderType,
      vnp_Locale: config.locale,
      vnp_ReturnUrl: `${baseURL}/payment/success?orderId=${orderData.orderId}`,
      vnp_ExpireDate: getExpireDate(), // Order expiry in YYYYMMDDHHmmss format
      vnp_CreateDate: getCurrentDateTime(),
    };

    // Optional fields
    if (orderData.buyerEmail) {
      vnpParams.vnp_Email = orderData.buyerEmail;
    }
    if (orderData.buyerPhone) {
      vnpParams.vnp_PhoneNumber = orderData.buyerPhone;
    }

    // Sort params for signature generation
    const sortedParams = sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();

    // Generate signature (HMAC SHA-512)
    // Note: This requires crypto-js library to work properly
    const signature = generateSignature(signData, config.hashSecret);
    vnpParams.vnp_SecureHash = signature;

    // Build payment URL
    const paymentUrl = new URL(config.baseUrl);
    Object.keys(vnpParams).forEach((key) => {
      paymentUrl.searchParams.append(key, vnpParams[key]);
    });

    console.log('[VNPAY Service] Payment URL generated:', paymentUrl.href);
    return paymentUrl.href;
  } catch (error) {
    console.error('[VNPAY Service] Error generating payment URL:', error);
    throw new Error('Lỗi tạo URL thanh toán VNPAY');
  }
};

/**
 * Verify VNPAY callback signature
 * @param {object} params - Query parameters from VNPAY callback
 * @param {string} params.vnp_SecureHash - Signature from VNPAY
 * @param {object} otherParams - Other parameters to verify
 * @returns {boolean} True if signature is valid
 *
 * @example
 * const isValid = vnpayService.verifySignature({
 *   vnp_SecureHash: '...',
 *   vnp_Amount: '25000000',
 *   vnp_TxnRef: 'ORD123'
 * });
 */
export const verifySignature = (params) => {
  try {
    const config = getConfig();
    const { vnp_SecureHash, ...otherParams } = params;

    // Sort and build data
    const sortedParams = sortObject(otherParams);
    const signData = new URLSearchParams(sortedParams).toString();

    // Generate signature to compare
    const calculatedSignature = generateSignature(signData, config.hashSecret);

    // Compare signatures
    return calculatedSignature === vnp_SecureHash;
  } catch (error) {
    console.error('[VNPAY Service] Error verifying signature:', error);
    return false;
  }
};

/**
 * Extract and parse VNPAY response parameters
 * @param {URLSearchParams} queryParams - URL query parameters from redirect
 * @returns {object} Parsed VNPAY response
 *
 * @example
 * const response = vnpayService.parseVNPAYResponse(new URLSearchParams(location.search));
 * console.log(response.responseCode); // '00' = success
 */
export const parseVNPAYResponse = (queryParams) => {
  try {
    return {
      responseCode: queryParams.get('vnp_ResponseCode'),
      message: queryParams.get('vnp_Message'),
      transactionId: queryParams.get('vnp_TransactionNo'),
      amount: parseInt(queryParams.get('vnp_Amount') || '0') / 100, // Convert back from cents
      payDate: queryParams.get('vnp_PayDate'),
      bankCode: queryParams.get('vnp_BankCode'),
      bankTranNo: queryParams.get('vnp_BankTranNo'),
      cardType: queryParams.get('vnp_CardType'),
      orderId: queryParams.get('orderId'),
      tmnCode: queryParams.get('vnp_TmnCode'),
      txnRef: queryParams.get('vnp_TxnRef'),
    };
  } catch (error) {
    console.error('[VNPAY Service] Error parsing VNPAY response:', error);
    return null;
  }
};

/**
 * Get current datetime in YYYYMMDDHHmmss format
 * @returns {string} Current datetime
 */
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Get order expiry datetime (24 hours from now) in YYYYMMDDHHmmss format
 * @returns {string} Expiry datetime
 */
const getExpireDate = () => {
  const now = new Date();
  now.setHours(now.getHours() + 24); // 24 hours expiry

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Get VNPAY error message for display
 * @param {string} code - VNPAY response code
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (code) => {
  const messages = {
    '00': 'Giao dịch thành công',
    '07': 'Merchant Synthesize',
    '09': 'Ngân hàng từ chối',
    '10': 'Checksum sai',
    '11': 'Merchant không được phép sử dụng phương thức thanh toán này',
    '12': 'Phiên làm việc hết hạn',
    '13': 'Lỗi do nhà cung cấp dịch vụ thanh toán',
    '20': 'Merchant không tồn tại trên hệ thống',
    '24': 'Khách hàng hủy giao dịch',
    '25': 'Giao dịch không thể hoàn tác',
    '51': 'Tài khoản không đủ tiền',
    '65': 'Tài khoản bị khóa',
    '75': 'Xảy ra lỗi trong quá trình xử lý tại cổng',
    '79': 'Lỗi do nhà cung cấp dịch vụ thanh toán',
    '99': 'Lỗi không xác định',
  };

  return messages[code] || 'Lỗi thanh toán không xác định';
};

/**
 * Format VNPAY amount from cents to VND
 * @param {number} cents - Amount in cents
 * @returns {string} Formatted amount
 */
export const formatAmount = (cents) => {
  const vnd = (cents / 100).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
  return vnd;
};

/**
 * Validate order amount
 * @param {number} amount - Amount in VND
 * @returns {boolean} True if amount is valid
 */
export const isValidAmount = (amount) => {
  const MIN_AMOUNT = 1000; // 1,000 VND minimum
  const MAX_AMOUNT = 9999999999; // 9,999,999,999 VND maximum
  return amount >= MIN_AMOUNT && amount <= MAX_AMOUNT;
};

export default {
  generatePaymentUrl,
  verifySignature,
  parseVNPAYResponse,
  getErrorMessage,
  formatAmount,
  isValidAmount,
};
