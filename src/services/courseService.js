import { mockCourses } from '../utils/mockData';
import api from './api';
const PAGE_DEFAULT = 1;
const PAGE_SIZE_DEFAULT = 10;

const resolvePage = (value) => {
  const page = Number(value);
  return Number.isFinite(page) && page > 0 ? page : PAGE_DEFAULT;
};

const resolveSize = (value, fallback = PAGE_SIZE_DEFAULT) => {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : fallback;
};

const getStartIndex = (page, size) => (page - 1) * size;

/**
 * Map mockCourses data to match CourseCard component expectations
 * mockCourses format → CourseCard format
 */
const formatCourseForCard = (course) => {
  return {
    ...course,
    // Ensure slug is preserved (critical for navigation)
    slug: course.slug || null,
    // Map image → thumbnail
    thumbnail: course.image || course.thumbnail,
    // Map category.name → categoryName
    categoryName: course.category?.name || course.categoryName,
    // Map instructor.fullName → instructorName
    instructorName: course.instructor?.fullName || course.instructor?.name || course.instructorName || 'Unknown Instructor',
    // Map description → shortDescription (truncate to first 100 chars)
    shortDescription: course.shortDescription || course.description?.substring(0, 100),
    // Preserve fullDescription for detail/edit pages
    fullDescription: course.fullDescription || course.description,
    // Map rating → avgRating (if using 'rating' field)
    avgRating: course.rating || course.avgRating,
    // Map discountPrice if price has discount
    discountPrice: course.originalPrice && course.price ? course.price : course.discountPrice,
    // Map category ID
    categoryId: course.categoryId || course.category?.id,
  };
};

export const courseService = {
  // Get all courses
  getAll: async (params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      console.log('[courseService.getAll] Fetching from backend API...');
      const response = await api.get(`/v1/courses?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getAll] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getAll] API error, using mock data:', error);
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      const start = getStartIndex(page, size);
      const data = mockCourses.slice(start, start + size).map(formatCourseForCard);
      return { data: { content: data, totalElements: mockCourses.length } };
    }
  },

  // Get course by ID
  getById: async (id) => {
    try {
      console.log('[courseService.getById] Fetching from backend API:', id);
      const response = await api.get(`/v1/courses/${id}`);
      const course = response.data?.data || response.data;
      const result = formatCourseForCard(course);
      console.log('[courseService.getById] Result:', result.id);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getById] API error, using mock data:', error);
      const course = mockCourses.find(c => c.id === id);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      return { data: formatCourseForCard(course) };
    }
  },

  // Get course by slug
  getBySlug: async (slug) => {
    try {
      console.log('[courseService.getBySlug] Fetching from backend API:', slug);
      const response = await api.get(`/v1/courses/slug/${slug}`);
      const course = response.data?.data || response.data;
      const result = formatCourseForCard(course);
      console.log('[courseService.getBySlug] Result:', result.id);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getBySlug] API error, using mock data:', error);
      const course = mockCourses.find(c => c.slug === slug);
      if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
      return { data: formatCourseForCard(course) };
    }
  },

  // Create new course
  create: async (data) => {
    try {
      console.log('[courseService.create] Creating course via backend API...');
      const response = await api.post('/v1/courses', data);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.create] API error:', error);
      throw error;
    }
  },

  // Update course
  update: async (id, data) => {
    try {
      console.log('[courseService.update] Updating course via backend API:', id);
      const response = await api.put(`/v1/courses/${id}`, data);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.update] API error:', error);
      throw error;
    }
  },

  // Delete course
  delete: async (id) => {
    try {
      console.log('[courseService.delete] Deleting course via backend API:', id);
      // Backend uses POST for delete, not DELETE verb
      const response = await api.post(`/v1/courses/${id}`);
      return { data: response.data?.data || response.data || { message: 'Xóa khóa học thành công' } };
    } catch (error) {
      console.error('[courseService.delete] API error:', error);
      throw error;
    }
  },

  // Search courses
  search: async (data) => {
    console.log('[courseService.search] Called with filters:', data);
    try {
      // Build search request body matching backend SearchCourseRequest DTO
      const searchRequest = {
        keyword: data.keyword,
        categoryId: data.categoryId,
        level: data.level,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        status: data.status,
      };

      // Build pagination params
      const params = new URLSearchParams();
      const page = resolvePage(data.page);
      const size = resolveSize(data.size);
      params.append('page', page);
      params.append('size', size);

      console.log('[courseService.search] Calling backend API POST /v1/courses/search with:', searchRequest);
      // Backend uses POST endpoint for advanced search
      const response = await api.post(`/v1/courses/search?${params.toString()}`, searchRequest);

      console.log('[courseService.search] API response:', response);

      // Handle response format: { success, code, data: { content, totalElements } }
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.search] Formatted result:', { content: content.length, total: totalElements });

      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.search] API error, falling back to mock data:', error);
      // Fallback to mock data
      let results = [...mockCourses];

      if (data.categoryId) {
        results = results.filter(c => c.categoryId === parseInt(data.categoryId));
      }
      if (data.level) {
        results = results.filter(c => c.level === data.level);
      }
      if (data.priceMin !== undefined) {
        results = results.filter(c => c.price >= data.priceMin);
      }
      if (data.priceMax !== undefined) {
        results = results.filter(c => c.price <= data.priceMax);
      }

      if (data.sort === 'popular') {
        results.sort((a, b) => b.students - a.students);
      } else if (data.sort === 'newest') {
        results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (data.sort === 'rating') {
        results.sort((a, b) => b.rating - a.rating);
      }

      const page = resolvePage(data.page);
      const size = resolveSize(data.size);
      const start = getStartIndex(page, size);
      const content = results.slice(start, start + size).map(formatCourseForCard);

      return { data: { content, totalElements: results.length } };
    }
  },

  // Get popular courses
  getPopular: async () => {
    try {
      console.log('[courseService.getPopular] Fetching trending courses from backend API...');
      const response = await api.get('/v1/courses/trending?page=1&size=8');
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || pageData || [];
      const result = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getPopular] Result:', result.length);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getPopular] API error, using mock data:', error);
      const popular = [...mockCourses].sort((a, b) => b.students - a.students).slice(0, 8).map(formatCourseForCard);
      return { data: popular };
    }
  },

  // Get newest courses
  getNewest: async () => {
    try {
      console.log('[courseService.getNewest] Fetching courses from backend API...');
      const response = await api.get('/v1/courses?page=1&size=4');
      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || pageData || [];
      const result = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getNewest] Result:', result.length);
      return { data: result };
    } catch (error) {
      console.error('[courseService.getNewest] API error, using mock data:', error);
      const newest = [...mockCourses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4).map(formatCourseForCard);
      return { data: newest };
    }
  },

  // Get courses by category
  getByCategory: async (categoryId, params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      console.log('[courseService.getByCategory] Fetching from backend API:', categoryId);
      // Backend uses /by-category/{categoryId} endpoint
      const response = await api.get(`/v1/courses/by-category/${categoryId}?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getByCategory] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getByCategory] API error, using mock data:', error);
      const filtered = mockCourses.filter(c => c.categoryId === parseInt(categoryId));
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      const start = getStartIndex(page, size);
      return { data: { content: filtered.slice(start, start + size).map(formatCourseForCard), totalElements: filtered.length } };
    }
  },

  // Get courses by instructor
  getByInstructor: async (instructorId, params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      console.log('[courseService.getByInstructor] Fetching from backend API - my courses...');
      const response = await api.get(`/v1/courses/my-courses?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getByInstructor] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getByInstructor] API error, using mock data:', error);
      const filtered = mockCourses.filter(c => c.instructorId === instructorId);
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size);
      const start = getStartIndex(page, size);
      return { data: { content: filtered.slice(start, start + size).map(formatCourseForCard), totalElements: filtered.length } };
    }
  },

  // Get my courses (instructor)
  getMyInstructorCourses: async (params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size, 20);
      console.log('[courseService.getMyInstructorCourses] Fetching from backend API...');
      const response = await api.get(`/v1/courses/my-courses?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getMyInstructorCourses] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.getMyInstructorCourses] API error:', error);
      throw error;
    }
  },

  // Get trending courses
  getTrendingCourses: async (params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size, 20);
      console.log('[courseService.getTrendingCourses] Fetching from backend API...');
      const response = await api.get(`/v1/courses/trending?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getTrendingCourses] Result:', content.length);
      return { data: content };
    } catch (error) {
      console.error('[courseService.getTrendingCourses] API error:', error);
      throw error;
    }
  },

  // Get top rated courses
  getTopRatedCourses: async (params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size, 20);
      console.log('[courseService.getTopRatedCourses] Fetching from backend API...');
      const response = await api.get(`/v1/courses/top-rated?page=${page}&size=${size}`);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.getTopRatedCourses] Result:', content.length);
      return { data: content };
    } catch (error) {
      console.error('[courseService.getTopRatedCourses] API error:', error);
      throw error;
    }
  },

  // Advanced search courses
  advancedSearch: async (request, params) => {
    try {
      const page = resolvePage(params?.page);
      const size = resolveSize(params?.size, 20);
      console.log('[courseService.advancedSearch] Searching from backend API...');
      const response = await api.post(`/v1/courses/search?page=${page}&size=${size}`, request);

      const pageData = response.data?.data || response.data;
      const courses = pageData?.content || [];
      const totalElements = pageData?.totalElements || 0;

      const content = (Array.isArray(courses) ? courses : []).map(formatCourseForCard);
      console.log('[courseService.advancedSearch] Result:', { content: content.length, total: totalElements });
      return { data: { content, totalElements } };
    } catch (error) {
      console.error('[courseService.advancedSearch] API error:', error);
      throw error;
    }
  },

  // Publish course
  publishCourse: async (courseId) => {
    try {
      console.log('[courseService.publishCourse] Publishing course:', courseId);
      const response = await api.post(`/v1/courses/${courseId}/publish`);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.publishCourse] API error:', error);
      throw error;
    }
  },

  // Unpublish course
  unpublishCourse: async (courseId) => {
    try {
      console.log('[courseService.unpublishCourse] Unpublishing course:', courseId);
      const response = await api.post(`/v1/courses/${courseId}/unpublish`);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.unpublishCourse] API error:', error);
      throw error;
    }
  },

  // Upload course thumbnail image
  uploadCourseImage: async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[courseService.uploadCourseImage] Uploading image for course:', courseId);
      // Don't set Content-Type header - let axios handle FormData automatically
      const response = await api.post(`/v1/courses/${courseId}/image`, formData);

      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.uploadCourseImage] API error:', error);
      throw error;
    }
  },

  // Upload course preview video
  uploadCoursePreviewVideo: async (courseId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[courseService.uploadCoursePreviewVideo] Uploading preview video for course:', courseId);
      // Don't set Content-Type header - let axios handle FormData automatically
      const response = await api.post(`/v1/courses/${courseId}/preview-video`, formData);

      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.uploadCoursePreviewVideo] API error:', error);
      throw error;
    }
  },

  // Approve course (admin only)
  approveCourse: async (courseId) => {
    try {
      console.log('[courseService.approveCourse] Approving course:', courseId);
      const response = await api.post(`/v1/courses/${courseId}/approve`);
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.approveCourse] API error:', error);
      throw error;
    }
  },

  // Reject course (admin only)
  rejectCourse: async (courseId, reason) => {
    try {
      console.log('[courseService.rejectCourse] Rejecting course:', courseId);
      const response = await api.post(`/v1/courses/${courseId}/reject`, { reason });
      const course = response.data?.data || response.data;
      return { data: formatCourseForCard(course) };
    } catch (error) {
      console.error('[courseService.rejectCourse] API error:', error);
      throw error;
    }
  },
};
