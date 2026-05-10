import api from './api';

/**
 * Admin Service - Handles all admin-specific API calls
 * Based on actual backend WithdrawalController, CourseController, CategoryController
 */

// ============ Category Management (Admin CRUD) ============

export const adminCategoryService = {
  /**
   * Get categories with pagination and search
   * GET /v1/categories?keyword=&page=1&pageSize=10
   */
  getAll: async (params = {}) => {
    try {
      const { keyword = '', page = 1, pageSize = 10 } = params;
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      queryParams.append('page', page);
      queryParams.append('pageSize', pageSize);

      const response = await api.get(`/v1/categories?${queryParams.toString()}`);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.pageNumber || pageData?.number || 0,
          pageSize: pageData?.pageSize || pageData?.size || 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.isLast ?? pageData?.last ?? true,
          hasContent: pageData?.hasContent ?? (pageData?.content?.length > 0) ?? false,
        }
      };
    } catch (error) {
      console.error('[adminCategoryService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   * GET /v1/categories/{categoryId}
   */
  getById: async (categoryId) => {
    try {
      const response = await api.get(`/v1/categories/${categoryId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminCategoryService.getById] Error:', error);
      throw error;
    }
  },

  /**
   * Create new category (Admin only)
   * POST /v1/categories
   */
  create: async (data) => {
    try {
      const response = await api.post('/v1/categories', {
        name: data.name,
        description: data.description || '',
      });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminCategoryService.create] Error:', error);
      throw error;
    }
  },

  /**
   * Update category (Admin only)
   * PUT /v1/categories/{categoryId}
   */
  update: async (categoryId, data) => {
    try {
      const response = await api.put(`/v1/categories/${categoryId}`, {
        name: data.name,
        description: data.description || '',
      });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminCategoryService.update] Error:', error);
      throw error;
    }
  },

  /**
   * Delete category (Admin only, soft delete)
   * DELETE /v1/categories/{categoryId}
   */
  delete: async (categoryId) => {
    try {
      const response = await api.delete(`/v1/categories/${categoryId}`);
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminCategoryService.delete] Error:', error);
      throw error;
    }
  },
};

// ============ Course Management (Admin) ============

export const adminCourseService = {
  /**
   * Search managed courses (Admin/Instructor)
   * POST /v1/courses/management/search?page=1&pageSize=10
   */
  searchManagedCourses: async (filters = {}, params = {}) => {
    try {
      const { page = 1, pageSize = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('pageSize', pageSize);

      const body = {};
      if (filters.keyword) body.keyword = filters.keyword;
      if (filters.status) body.courseStatus = filters.status;
      if (filters.level) body.courseLevel = filters.level;
      if (filters.categoryId) body.categoryId = filters.categoryId;

      const response = await api.post(`/v1/courses/management/search?${queryParams.toString()}`, body);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.pageNumber || pageData?.number || 0,
          pageSize: pageData?.pageSize || pageData?.size || 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.isLast ?? pageData?.last ?? true,
          hasContent: pageData?.hasContent ?? (pageData?.content?.length > 0) ?? false,
        }
      };
    } catch (error) {
      console.error('[adminCourseService.searchManagedCourses] Error:', error);
      throw error;
    }
  },

  /**
   * Approve course (Admin only)
   * POST /v1/courses/{courseId}/approve
   */
  approve: async (courseId) => {
    try {
      const response = await api.post(`/v1/courses/${courseId}/approve`);
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminCourseService.approve] Error:', error);
      throw error;
    }
  },

  /**
   * Reject course (Admin only)
   * POST /v1/courses/{courseId}/reject
   */
  reject: async (courseId, reason) => {
    try {
      const response = await api.post(`/v1/courses/${courseId}/reject`, { reason });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminCourseService.reject] Error:', error);
      throw error;
    }
  },

  /**
   * Get enrolled students for a course (Admin/Instructor)
   * GET /v1/learning/instructor/courses/{courseId}/students?page=0&size=10
   * NOTE: Backend uses 0-based pagination (Spring Pageable)
   */
  /**
   * Get a student's detailed progress in a course (Admin/Instructor)
   * GET /v1/learning/instructor/courses/{courseId}/students/{studentId}/progress
   */
  getStudentProgress: async (courseId, studentId) => {
    try {
      const response = await api.get(
        `/v1/learning/instructor/courses/${courseId}/students/${studentId}/progress`
      );
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminCourseService.getStudentProgress] Error:', error);
      throw error;
    }
  },

  getStudentsByCourse: async (courseId, params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(
        `/v1/learning/instructor/courses/${courseId}/students?${queryParams.toString()}`
      );
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.number ?? pageData?.pageNumber ?? 0,
          pageSize: pageData?.size ?? pageData?.pageSize ?? 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.last ?? pageData?.isLast ?? true,
        }
      };
    } catch (error) {
      console.error('[adminCourseService.getStudentsByCourse] Error:', error);
      throw error;
    }
  },
};

// ============ Withdrawal Management (Admin) ============
// Based on actual WithdrawalController backend endpoints

export const adminWithdrawalService = {
  /**
   * Get all withdrawal requests (Admin only)
   * GET /v1/withdrawal/admin/all?page=0&size=10
   * NOTE: Backend uses 0-based pagination
   */
  getAll: async (params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/withdrawal/admin/all?${queryParams.toString()}`);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.number ?? pageData?.pageNumber ?? 0,
          pageSize: pageData?.size ?? pageData?.pageSize ?? 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.last ?? pageData?.isLast ?? true,
          hasContent: (pageData?.content?.length > 0) || false,
        }
      };
    } catch (error) {
      console.error('[adminWithdrawalService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Get pending withdrawal requests (Admin only)
   * GET /v1/withdrawal/admin/pending?page=0&size=10
   */
  getPending: async (params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/withdrawal/admin/pending?${queryParams.toString()}`);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.number ?? pageData?.pageNumber ?? 0,
          pageSize: pageData?.size ?? pageData?.pageSize ?? 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.last ?? pageData?.isLast ?? true,
          hasContent: (pageData?.content?.length > 0) || false,
        }
      };
    } catch (error) {
      console.error('[adminWithdrawalService.getPending] Error:', error);
      throw error;
    }
  },

  /**
   * Get withdrawal requests by status (Admin only)
   * GET /v1/withdrawal/admin/status/{status}?page=0&size=10
   * @param {string} status - PENDING, APPROVED, REJECTED, COMPLETED, CANCELLED
   */
  getByStatus: async (status, params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/withdrawal/admin/status/${status}?${queryParams.toString()}`);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.number ?? pageData?.pageNumber ?? 0,
          pageSize: pageData?.size ?? pageData?.pageSize ?? 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.last ?? pageData?.isLast ?? true,
          hasContent: (pageData?.content?.length > 0) || false,
        }
      };
    } catch (error) {
      console.error('[adminWithdrawalService.getByStatus] Error:', error);
      throw error;
    }
  },

  /**
   * Get withdrawal request by ID
   * GET /v1/withdrawal/request/{requestId}
   */
  getById: async (requestId) => {
    try {
      const response = await api.get(`/v1/withdrawal/request/${requestId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminWithdrawalService.getById] Error:', error);
      throw error;
    }
  },

  /**
   * Approve withdrawal request (Admin only)
   * POST /v1/withdrawal/admin/approve/{requestId}
   */
  approve: async (requestId) => {
    try {
      const response = await api.post(`/v1/withdrawal/admin/approve/${requestId}`);
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminWithdrawalService.approve] Error:', error);
      throw error;
    }
  },

  /**
   * Reject withdrawal request (Admin only)
   * POST /v1/withdrawal/admin/reject/{requestId}?rejectReason=...
   * NOTE: rejectReason is a @RequestParam, NOT body JSON
   */
  reject: async (requestId, rejectReason) => {
    try {
      const response = await api.post(
        `/v1/withdrawal/admin/reject/${requestId}?rejectReason=${encodeURIComponent(rejectReason)}`
      );
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminWithdrawalService.reject] Error:', error);
      throw error;
    }
  },

  /**
   * Complete withdrawal request (Admin only)
   * POST /v1/withdrawal/admin/complete/{requestId}?transactionId=...
   * NOTE: transactionId is a @RequestParam
   */
  complete: async (requestId, transactionId) => {
    try {
      const response = await api.post(
        `/v1/withdrawal/admin/complete/${requestId}?transactionId=${encodeURIComponent(transactionId)}`
      );
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminWithdrawalService.complete] Error:', error);
      throw error;
    }
  },
};

// ============ Dashboard (Admin) ============

export const adminDashboardService = {
  /**
   * Get admin dashboard statistics
   * GET /v1/dashboard/admin
   * Returns: totalUsers, totalStudents, totalInstructors, totalCourses,
   *          publishedCourses, pendingReviewCourses, totalEnrollments,
   *          totalOrders, completedOrders, totalRevenue, averageOrderValue,
   *          dailyRevenue[], monthlyRevenue[], dailyEnrollments[],
   *          courseStatusDistribution[], orderStatusDistribution[],
   *          topSellingCourses[]
   */
  getStats: async () => {
    try {
      const response = await api.get('/v1/dashboard/admin');
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminDashboardService.getStats] Error:', error);
      throw error;
    }
  },

  getPlatformFee: async () => {
    try {
      const response = await api.get('/v1/admin/platform/fee');
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminDashboardService.getPlatformFee] Error:', error);
      throw error;
    }
  },

  updatePlatformFee: async (platformFeePercent) => {
    try {
      const response = await api.put('/v1/admin/platform/fee', { platformFeePercent });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminDashboardService.updatePlatformFee] Error:', error);
      throw error;
    }
  },
};

// ============ Notification Management (Admin) ============

export const adminNotificationService = {
  /**
   * Get current user's notifications (Admin)
   * GET /v1/notifications?page=0&size=10
   */
  getAll: async (params = {}) => {
    try {
      const { page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/notifications?${queryParams.toString()}`);
      const pageData = response.data?.data || response.data;
      return {
        data: {
          content: pageData?.content || [],
          pageNumber: pageData?.number ?? pageData?.pageNumber ?? 0,
          pageSize: pageData?.size ?? pageData?.pageSize ?? 10,
          totalElements: pageData?.totalElements || 0,
          totalPages: pageData?.totalPages || 0,
          isLast: pageData?.last ?? pageData?.isLast ?? true,
        }
      };
    } catch (error) {
      console.error('[adminNotificationService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Get unread notification count
   * GET /v1/notifications/unread-count
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/v1/notifications/unread-count');
      const data = response.data?.data || response.data;
      return { count: data?.count ?? 0 };
    } catch (error) {
      console.error('[adminNotificationService.getUnreadCount] Error:', error);
      throw error;
    }
  },

  /**
   * Mark notification as read
   * POST /v1/notifications/{notificationId}/read
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await api.post(`/v1/notifications/${notificationId}/read`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminNotificationService.markAsRead] Error:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   * POST /v1/notifications/read-all
   */
  markAllAsRead: async () => {
    try {
      const response = await api.post('/v1/notifications/read-all');
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminNotificationService.markAllAsRead] Error:', error);
      throw error;
    }
  },

  /**
   * Create notification for a user (Admin only)
   * POST /v1/notifications
   * @param {Object} data - { userId, type, title, message, referenceId?, referenceType? }
   * type: COURSE_APPROVED, COURSE_REJECTED, NEW_ENROLLMENT, NEW_REVIEW,
   *       PAYMENT_SUCCESS, PAYMENT_FAILED, QUIZ_RESULT, CERTIFICATE_ISSUED,
   *       AI_RECOMMENDATION, SYSTEM
   */
  create: async (data) => {
    try {
      const response = await api.post('/v1/notifications', data);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminNotificationService.create] Error:', error);
      throw error;
    }
  },
};

// ============ User Management (Admin) ============

export const adminUserService = {
  /**
   * Lấy danh sách người dùng
   * GET /v1/admin/users
   */
  getAll: async (params = {}) => {
    try {
      const { keyword, roleCode, active, isLocked, page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (roleCode) queryParams.append('roleCode', roleCode);
      if (active) queryParams.append('active', active);
      if (isLocked !== undefined) queryParams.append('isLocked', isLocked);
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/admin/users?${queryParams.toString()}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminUserService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết người dùng
   * GET /v1/admin/users/{userId}
   */
  getById: async (userId) => {
    try {
      const response = await api.get(`/v1/admin/users/${userId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminUserService.getById] Error:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái người dùng (Active/Inactive)
   * PUT /v1/admin/users/{userId}/status
   */
  updateStatus: async (userId, active) => {
    try {
      const response = await api.put(`/v1/admin/users/${userId}/status`, { active });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminUserService.updateStatus] Error:', error);
      throw error;
    }
  },

  /**
   * Khóa/mở khóa tài khoản
   * PUT /v1/admin/users/{userId}/lock
   */
  lockAccount: async (userId, isLocked, reason) => {
    try {
      const response = await api.put(`/v1/admin/users/${userId}/lock`, { isLocked, reason });
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminUserService.lockAccount] Error:', error);
      throw error;
    }
  },

  /**
   * Xóa người dùng (Soft Delete)
   * DELETE /v1/admin/users/{userId}
   */
  delete: async (userId) => {
    try {
      const response = await api.delete(`/v1/admin/users/${userId}`);
      return { data: response.data?.data || response.data, message: response.data?.message };
    } catch (error) {
      console.error('[adminUserService.delete] Error:', error);
      throw error;
    }
  },
};

// ============ Teacher Management (Admin) ============

export const adminTeacherService = {
  /**
   * Lấy danh sách giáo viên
   * GET /v1/admin/teachers
   */
  getAll: async (params = {}) => {
    try {
      const { keyword, active, isLocked, page = 0, size = 10 } = params;
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (active) queryParams.append('active', active);
      if (isLocked !== undefined) queryParams.append('isLocked', isLocked);
      queryParams.append('page', page);
      queryParams.append('size', size);

      const response = await api.get(`/v1/admin/teachers?${queryParams.toString()}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminTeacherService.getAll] Error:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết giáo viên
   * GET /v1/admin/teachers/{teacherId}
   */
  getById: async (teacherId) => {
    try {
      const response = await api.get(`/v1/admin/teachers/${teacherId}`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminTeacherService.getById] Error:', error);
      throw error;
    }
  },

  /**
   * Lấy thống kê giáo viên
   * GET /v1/admin/teachers/{teacherId}/statistics
   */
  getStatistics: async (teacherId) => {
    try {
      const response = await api.get(`/v1/admin/teachers/${teacherId}/statistics`);
      return { data: response.data?.data || response.data };
    } catch (error) {
      console.error('[adminTeacherService.getStatistics] Error:', error);
      throw error;
    }
  },
};
