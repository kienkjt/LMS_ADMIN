import i18n from '../i18n';

/**
 * Extract validation errors thành object { field: error message }
 * Dùng để hiển thị lỗi trực tiếp tại từng field trong form
 * 
 * Backend trả về: { data: { phoneNumber: "Lỗi...", email: "Lỗi..." } }
 * Frontend trả ra: { phoneNumber: "Lỗi...", email: "Lỗi..." }
 */
export const extractValidationErrors = (error) => {
  const errorData = error.response?.data || {};
  const { data } = errorData;
  
  // Nếu data là object validation errors (không phải null), trả về
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }
  
  return null;
};

/**
 * Xử lý lỗi từ API response
 * Backend trả về: { success: false, code: 400, message: "...", data: null/object, timestamp: "..." }
 * - Nếu data là object: validation errors, trích xuất để dùng với form
 * - Nếu message: hiển thị trực tiếp
 */
export const handleApiError = (error) => {
  const errorData = error.response?.data || {};
  const { message, data, code } = errorData;

  // Ưu tiên 1: Nếu data chứa validation errors (object), combine lại
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const errorMessages = Object.entries(data)
      .map(([field, msg]) => msg)
      .filter(msg => msg);
    
    if (errorMessages.length > 0) {
      return errorMessages.join('\n');
    }
  }

  // Ưu tiên 2: Dùng message từ backend
  if (message) {
    return message;
  }

  // Ưu tiên 3: Xử lý các http status code chung
  const status = error.response?.status;
  switch (status) {
    case 401:
      return i18n.t('errors.UNAUTHORIZED');
    case 403:
      return i18n.t('errors.FORBIDDEN');
    case 404:
      return i18n.t('errors.NOT_FOUND');
    case 400:
      return i18n.t('errors.BAD_REQUEST');
    case 500:
      return i18n.t('errors.INTERNAL_SERVER_ERROR');
    default:
      return error.message || i18n.t('errors.INTERNAL_SERVER_ERROR');
  }
};

/**
 * Xử lý thông báo thành công
 * Backend trả về: { successKey: 'LOGIN_SUCCESS', params: {...} }
 */
export const handleApiSuccess = (response) => {
  const { successKey, message, params } = response.data || {};

  if (successKey) {
    return i18n.t(`success.${successKey}`, params);
  }

  return message || i18n.t('success.LOGIN_SUCCESS');
};

/**
 * Xử lý cảnh báo
 */
export const handleApiWarning = (response) => {
  const { warningKey, message, params } = response.data || {};

  if (warningKey) {
    return i18n.t(`warnings.${warningKey}`, params);
  }

  return message || '';
};

/**
 * Map error key để có fallback tốt hơn
 */
export const getErrorMessageByCode = (errorCode, params = {}) => {
  const key = `errors.${errorCode}`;
  const message = i18n.t(key, params);
  
  // Nếu không tìm thấy translation, trả về error code
  return message === key ? errorCode : message;
};

/**
 * Format error message với params
 */
export const formatErrorMessage = (errorKey, params = {}) => {
  return i18n.t(`errors.${errorKey}`, params);
};
