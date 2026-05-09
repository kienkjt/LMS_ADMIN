import api from './api';
import { mockEnrollments, mockCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const enrollmentService = {
  /**
   * Enroll student in a course
   * @param {string} courseId - Course ID
   * @returns Response with EnrollmentResponseDto
   */
  enroll: async (courseId) => {
    try {
      console.log('[enrollmentService.enroll] Enrolling in course:', courseId);
      const response = await api.post(`/api/v1/learning/courses/${courseId}/enroll`);
      const enrollment = response.data?.data || response.data;
      console.log('[enrollmentService.enroll] Success');
      return { data: enrollment };
    } catch (error) {
      console.error('[enrollmentService.enroll] API error, using mock data:', error);
      // Fallback to mock
      await delay(300);
      const course = mockCourses.find(c => c.id === courseId);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      const enrollment = {
        id: `enroll-${Date.now()}`,
        userId: 'user-1',
        courseId,
        course,
        enrolledAt: new Date().toISOString().split('T')[0],
        completedAt: null,
        certificateIssued: false,
        progressPercent: 0,
        lastAccessedAt: new Date().toISOString().split('T')[0],
      };
      mockEnrollments.push(enrollment);
      return { data: enrollment };
    }
  },

  /**
   * Unenroll from a course
   * @param {string} courseId - Course ID
   * @returns Response
   */
  unenroll: async (courseId) => {
    try {
      console.log('[enrollmentService.unenroll] Unenrolling from course:', courseId);
      const response = await api.post(`/api/v1/learning/courses/${courseId}/unenroll`);
      console.log('[enrollmentService.unenroll] Success');
      return { data: response.data?.data || response.data || { message: 'Hủy đăng ký thành công' } };
    } catch (error) {
      console.error('[enrollmentService.unenroll] API error, using mock data:', error);
      // Fallback to mock
      await delay(300);
      const index = mockEnrollments.findIndex(e => e.courseId === courseId);
      if (index === -1) throw { response: { status: 404, data: { message: 'Đăng ký không tìm thấy' } } };
      mockEnrollments.splice(index, 1);
      return { data: { message: 'Hủy đăng ký thành công' } };
    }
  },

  /**
   * Mark lesson as complete
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns Response with CourseProgressResponseDto
   */
  completeLesson: async (courseId, lessonId) => {
    try {
      console.log('[enrollmentService.completeLesson] Marking lesson complete:', lessonId);
      const response = await api.post(
        `/api/v1/learning/courses/${courseId}/lessons/${lessonId}/complete`
      );
      const progress = response.data?.data || response.data;
      console.log('[enrollmentService.completeLesson] Success, progress updated');
      return { data: progress };
    } catch (error) {
      console.error('[enrollmentService.completeLesson] Error:', error);
      throw error;
    }
  },

  /**
   * Get progress for a course
   * @param {string} courseId - Course ID
   * @returns Response with CourseProgressResponseDto
   */
  getProgress: async (courseId) => {
    try {
      console.log('[enrollmentService.getProgress] Fetching progress for course:', courseId);
      const response = await api.get(`/api/v1/learning/courses/${courseId}/progress`);
      const progress = response.data?.data || response.data;
      console.log('[enrollmentService.getProgress] Success');
      return { data: progress };
    } catch (error) {
      console.error('[enrollmentService.getProgress] Error:', error);
      throw error;
    }
  },

  /**
   * Get enrollment for a course
   * @param {string} courseId - Course ID
   * @returns Response with EnrollmentResponseDto
   */
  getEnrollment: async (courseId) => {
    try {
      console.log('[enrollmentService.getEnrollment] Fetching enrollment for course:', courseId);
      const response = await api.get(`/api/v1/learning/my-courses`);
      const courses = response.data?.data || response.data || [];
      const enrollment = courses.find(c => c.courseId === courseId);
      if (!enrollment) throw { response: { status: 404, data: { message: 'Đăng ký không tìm thấy' } } };
      return { data: enrollment };
    } catch (error) {
      console.error('[enrollmentService.getEnrollment] Error:', error);
      throw error;
    }
  },

  /**
   * Get all enrolled courses for current student
   * @returns Response with list of EnrolledCourseResponseDto
   */
  getStudentCourses: async () => {
    try {
      console.log('[enrollmentService.getStudentCourses] Fetching student courses');
      const response = await api.get('/api/v1/learning/my-courses');
      const courses = response.data?.data || response.data || [];
      console.log('[enrollmentService.getStudentCourses] Success, found:', courses.length);
      return { data: courses };
    } catch (error) {
      console.error('[enrollmentService.getStudentCourses] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const courses = mockEnrollments.filter(e => e.userId === 'user-1');
      return { data: courses };
    }
  },

  /**
   * Get enrolled courses with pagination
   * @param {object} params - Pagination params { page, size }
   * @returns Response with paginated list
   */
  getStudentCoursesPaginated: async (params) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      console.log('[enrollmentService.getStudentCoursesPaginated] Fetching with pagination');
      const response = await api.get(`/api/v1/learning/my-courses?page=${page}&size=${size}`);
      const pageData = response.data?.data || response.data;
      console.log('[enrollmentService.getStudentCoursesPaginated] Success');
      return { data: pageData };
    } catch (error) {
      console.error('[enrollmentService.getStudentCoursesPaginated] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const courses = mockEnrollments.filter(e => e.userId === 'user-1');
      const page = params?.page || 1;
      const size = params?.size || 10;
      const start = (page - 1) * size;
      return { data: { content: courses.slice(start, start + size), totalElements: courses.length } };
    }
  },

  /**
   * Get all students enrolled in a course (instructor only)
   * @param {string} courseId - Course ID
   * @returns Response with list of enrollments
   */
  getCourseStudents: async (courseId) => {
    try {
      console.log('[enrollmentService.getCourseStudents] Fetching students for course:', courseId);
      const response = await api.get(`/api/v1/learning/courses/${courseId}/students`);
      const students = response.data?.data || response.data || [];
      console.log('[enrollmentService.getCourseStudents] Success, found:', students.length);
      return { data: students };
    } catch (error) {
      console.error('[enrollmentService.getCourseStudents] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const students = mockEnrollments.filter(e => e.courseId === courseId);
      return { data: students };
    }
  },

  /**
   * Get course students with pagination (instructor only)
   * @param {string} courseId - Course ID
   * @param {object} params - Pagination params
   * @returns Response with paginated list
   */
  getCourseStudentsPaginated: async (courseId, params) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      console.log('[enrollmentService.getCourseStudentsPaginated] Fetching for course:', courseId);
      const response = await api.get(
        `/api/v1/learning/courses/${courseId}/students?page=${page}&size=${size}`
      );
      const pageData = response.data?.data || response.data;
      console.log('[enrollmentService.getCourseStudentsPaginated] Success');
      return { data: pageData };
    } catch (error) {
      console.error('[enrollmentService.getCourseStudentsPaginated] API error, using mock data:', error);
      // Fallback to mock
      await delay(200);
      const students = mockEnrollments.filter(e => e.courseId === courseId);
      const page = params?.page || 1;
      const size = params?.size || 10;
      const start = (page - 1) * size;
      return { data: { content: students.slice(start, start + size), totalElements: students.length } };
    }
  },
};
