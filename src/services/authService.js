import api from './api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../utils/constants';

const DEFAULT_ERROR_MESSAGE = 'Đã xảy ra lỗi. Vui lòng thử lại sau';

/**
 * Format error response to match expected structure
 * Handles various error response formats from backend
 */
const formatError = (error) => {
  let message = DEFAULT_ERROR_MESSAGE;

  // Try to extract message from various possible error structures
  if (error?.response) {
    const { data, status, statusText } = error.response;

    // Log actual response for debugging
    console.debug('API Error Response:', { data, status, statusText });

    // Structure 1: error.response.data.message (APIResponse format)
    if (typeof data === 'string') {
      message = data;
    }
    // Structure 2: error.response.data.message (direct message)
    else if (data?.message) {
      message = data.message;
    }
    // Structure 3: error.response.data.data?.message (nested data)
    else if (data?.data?.message) {
      message = data.data.message;
    }
    // Structure 4: error.response.data.error (Spring Boot error)
    else if (data?.error) {
      message = data.error;
    }
    // Structure 5: error.response.statusText as fallback
    else if (statusText && statusText !== 'OK') {
      message = statusText;
    }
  }
  // Network error
  else if (error?.message === 'Network Error') {
    message = 'Lỗi kết nối. Vui lòng kiểm tra kết nối internet';
  }
  // Generic error message
  else if (error?.message) {
    message = error.message;
  }

  // Always return error with message at response.data.message level
  return {
    ...error,
    response: {
      ...error?.response,
      data: {
        ...(error?.response?.data || {}),
        message: message,
      },
    },
  };
};

export const authService = {
  /**
   * Register a new user
   * @param {Object} data - Registration data (email, password, fullName, role)
   */
  register: async (data) => {
    try {
      const response = await api.post('/v1/auth/register', {
        email: data.email,
        password: data.password,
        fullName: data.fullName || data.name,
        role: data.role || 'STUDENT',
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Login user with email and password
   * @param {Object} data - Login credentials (email, password)
   */
  login: async (data) => {
    try {
      const response = await api.post('/v1/auth/login', {
        email: data.email,
        password: data.password,
      });

      // Store tokens from response
      if (response.data?.data) {
        const loginData = response.data.data;
        localStorage.setItem(TOKEN_KEY, loginData.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);

        console.debug('[Auth] Tokens stored:', {
          accessToken: loginData.accessToken ? `${loginData.accessToken.substring(0, 20)}...` : 'EMPTY',
          refreshToken: loginData.refreshToken ? `${loginData.refreshToken.substring(0, 20)}...` : 'EMPTY',
        });

        // Verify tokens are in localStorage
        const storedToken = localStorage.getItem(TOKEN_KEY);
        console.debug('[Auth] Token verification - stored in localStorage:', storedToken ? `${storedToken.substring(0, 20)}...` : 'FAILED');

        // Store user info (role)
        const userInfo = {
          role: loginData.role,
          email: data.email,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo));
      }
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await api.post('/v1/auth/logout');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return { data: { message: 'Đăng xuất thành công' } };
    } catch {
      // Clear local storage even if logout API fails
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return { data: { message: 'Đăng xuất thành công' } };
    }
  },

  /**
   * Verify OTP
   * @param {Object} data - OTP data (email, otp)
   */
  verifyOtp: async (data) => {
    try {
      const response = await api.post('/v1/auth/verify-otp', {
        email: data.email,
        otp: data.otp,
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Send forgot password OTP
   * @param {Object} data - Email data
   */
  forgotPassword: async (data) => {
    try {
      const response = await api.post('/v1/auth/forgot-password', {
        email: data.email,
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Verify reset password OTP
   * @param {Object} data - OTP verification data (email, otp)
   */
  verifyResetOtp: async (data) => {
    try {
      const response = await api.post('/v1/auth/verify-reset-otp', {
        email: data.email,
        otp: data.otp,
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Reset password
   * @param {Object} data - Reset password data (email, newPassword)
   */
  resetPassword: async (data) => {
    try {
      const response = await api.post('/v1/auth/reset-password', {
        email: data.email,
        newPassword: data.newPassword,
      });
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Refresh access token
   * @param {Object} data - Refresh token data
   */
  refreshToken: async (data) => {
    try {
      const response = await api.post('/v1/auth/refresh-token', {
        refreshToken: data.refreshToken,
      });

      // Update stored tokens
      if (response.data?.data) {
        const loginData = response.data.data;
        localStorage.setItem(TOKEN_KEY, loginData.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, loginData.refreshToken);
      }
      return response;
    } catch (error) {
      throw formatError(error);
    }
  },

  /**
   * Get current authenticated user from localStorage
   */
  getCurrentUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  /**
   * Get stored access token
   */
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),

  /**
   * Get stored refresh token
   */
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
};

/**
 * Extract error message from API error response
 * Helper function for components to use
 */
export const getErrorMessage = (error) => {
  if (!error) return DEFAULT_ERROR_MESSAGE;

  // If error has already been formatted by formatError
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Fallback
  return DEFAULT_ERROR_MESSAGE;
};
