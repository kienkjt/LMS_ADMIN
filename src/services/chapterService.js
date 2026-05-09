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

export const chapterService = {
  /**
   * Create a new chapter for a course
   * @param {string} courseId - Course ID
   * @param {object} data - Chapter data { title, description }
   * @returns Response with ChapterResponseDto
   */
  createChapter: async (courseId, data) => {
    try {
      console.log('[chapterService.createChapter] Creating chapter for course:', courseId);
      const response = await api.post(`/api/v1/courses/${courseId}/chapters`, {
        title: data.title,
        description: data.description || '',
      });
      const chapter = response.data?.data || response.data;
      console.log('[chapterService.createChapter] Success:', chapter.id);
      return { data: chapter };
    } catch (error) {
      console.error('[chapterService.createChapter] Error:', error);
      throw error;
    }
  },

  /**
   * Get all chapters for a course
   * @param {string} courseId - Course ID
   * @returns Response with list of ChapterResponseDto
   */
  getChaptersByCourse: async (courseId) => {
    try {
      console.log('[chapterService.getChaptersByCourse] Fetching chapters for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/chapters`);
      const chapters = response.data?.data || response.data || [];
      console.log('[chapterService.getChaptersByCourse] Success, found:', chapters.length);
      return { data: chapters };
    } catch (error) {
      console.error('[chapterService.getChaptersByCourse] Error:', error);
      throw error;
    }
  },

  /**
   * Get a single chapter by ID
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @returns Response with ChapterResponseDto
   */
  getChapterById: async (courseId, chapterId) => {
    try {
      console.log('[chapterService.getChapterById] Fetching chapter:', chapterId);
      const response = await api.get(`/api/v1/courses/${courseId}/chapters/${chapterId}`);
      const chapter = response.data?.data || response.data;
      console.log('[chapterService.getChapterById] Success');
      return { data: chapter };
    } catch (error) {
      console.error('[chapterService.getChapterById] Error:', error);
      throw error;
    }
  },

  /**
   * Update a chapter
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {object} data - Update data { title, description }
   * @returns Response with updated ChapterResponseDto
   */
  updateChapter: async (courseId, chapterId, data) => {
    try {
      console.log('[chapterService.updateChapter] Updating chapter:', chapterId);
      const response = await api.put(`/api/v1/courses/${courseId}/chapters/${chapterId}`, {
        title: data.title,
        description: data.description || '',
      });
      const chapter = response.data?.data || response.data;
      console.log('[chapterService.updateChapter] Success');
      return { data: chapter };
    } catch (error) {
      console.error('[chapterService.updateChapter] Error:', error);
      throw error;
    }
  },

  /**
   * Delete a chapter
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @returns Response
   */
  deleteChapter: async (courseId, chapterId) => {
    try {
      console.log('[chapterService.deleteChapter] Deleting chapter:', chapterId);
      // Backend uses POST for delete
      const response = await api.post(`/api/v1/courses/${courseId}/chapters/${chapterId}`);
      console.log('[chapterService.deleteChapter] Success');
      return { data: response.data?.data || response.data || { message: 'Xóa chương thành công' } };
    } catch (error) {
      console.error('[chapterService.deleteChapter] Error:', error);
      throw error;
    }
  },
};
