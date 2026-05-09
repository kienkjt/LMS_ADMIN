import axios from 'axios';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../utils/constants';
import { handleApiError } from '../utils/errorHandler';
import i18n from '../i18n';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const language = i18n.language || 'vi';

    // Set Accept-Language header cho backend tra cứu locale
    config.headers['Accept-Language'] = language;

    console.debug('[API] Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NOT FOUND');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('[API] Request URL:', config.url);
      console.debug('[API] Authorization header set:', config.headers.Authorization ? 'YES' : 'NO');
    } else {
      console.warn('[API] No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.debug('[API] Response successful:', response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = handleApiError(error);

    console.error('[API] Error response:', {
      url: originalRequest?.url,
      status: error.response?.status,
      message: error.response?.data?.message,
      errorKey: error.response?.data?.errorKey,
      i18nMessage: errorMessage,
      data: error.response?.data,
      headers: originalRequest?.headers,
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[API] 401 error - attempting token refresh...');
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        console.debug('[API] Refresh token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'NOT FOUND');

        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/v1/auth/refresh-token`,
            { refreshToken }
          );
          // Backend returns data in response.data.data structure
          const loginData = response.data?.data || response.data;
          const { accessToken } = loginData;
          localStorage.setItem(TOKEN_KEY, accessToken);
          console.debug('[API] Token refreshed successfully');
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API] Token refresh failed:', refreshError.message);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
