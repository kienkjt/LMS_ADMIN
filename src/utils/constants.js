export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'LMS';

export const ROLES = {
  STUDENT: 'ROLE_STUDENT',
  INSTRUCTOR: 'ROLE_INSTRUCTOR',
  ADMIN: 'ROLE_ADMIN',
};

// Helper function to get user-friendly role display
export const getRoleDisplay = (role) => {
  switch (role) {
    case 'ROLE_INSTRUCTOR':
    case 'INSTRUCTOR':
      return 'Giảng viên';
    case 'ROLE_ADMIN':
    case 'ADMIN':
      return 'Quản trị viên';
    case 'ROLE_STUDENT':
    case 'STUDENT':
    default:
      return 'Học viên';
  }
};

export const COURSE_LEVELS = {
  BEGINNER: 'BEGINNER',
  INTERMEDIATE: 'INTERMEDIATE',
  ADVANCED: 'ADVANCED',
};

export const COURSE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  PENDING_REVIEW: 'PENDING_REVIEW',
  APPROVED: 'APPROVED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  ARCHIVED: 'ARCHIVED',
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

export const WITHDRAWAL_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const TOKEN_KEY = 'lms_access_token';
export const REFRESH_TOKEN_KEY = 'lms_refresh_token';
export const USER_KEY = 'lms_user';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_SIZE: 10,
};

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  COURSES: '/courses',
  COURSE_DETAIL: '/courses/:slug',
  SEARCH: '/search',

  // Student
  CART: '/cart',
  CHECKOUT: '/checkout',
  WISHLIST: '/wishlist',
  PROFILE: '/profile',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_COURSES: '/student/courses',
  STUDENT_ORDERS: '/student/orders',
  STUDENT_CERTIFICATES: '/student/certificates',
  LEARNING: '/learn/:courseId',
  QUIZ: '/learn/:courseId/quiz/:quizId',

  // Instructor
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  INSTRUCTOR_COURSES: '/instructor/courses',
  INSTRUCTOR_CREATE_COURSE: '/instructor/courses/create',
  INSTRUCTOR_EDIT_COURSE: '/instructor/courses/edit/:courseId',
  INSTRUCTOR_CHAPTERS: '/instructor/courses/:courseId/chapters',
  INSTRUCTOR_COURSE_DETAIL: '/instructor/courses/:courseId',
  INSTRUCTOR_STUDENTS: '/instructor/students',
  INSTRUCTOR_QUIZ: '/instructor/courses/:courseId/quiz',
  INSTRUCTOR_REVENUE: '/instructor/revenue',
  INSTRUCTOR_QA: '/instructor/qa',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_TEACHERS: '/admin/teachers',
  ADMIN_COURSES: '/admin/courses',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
  ADMIN_NOTIFICATIONS: '/admin/notifications',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_STUDENT_PROGRESS: '/admin/courses/:courseId/students/:studentId/progress',

  // Error
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/404',
};
