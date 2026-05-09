import api from './api';

export const lessonService = {
  /**
   * Get all lessons for a chapter
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @returns Response with list of LessonResponseDto
   */
  getLessonsByChapter: async (courseId, chapterId) => {
    try {
      console.log('[lessonService.getLessonsByChapter] Fetching lessons for chapter:', chapterId);
      const response = await api.get(`/v1/courses/${courseId}/chapters/${chapterId}/lessons`);
      const lessons = response.data?.data || response.data || [];
      console.log('[lessonService.getLessonsByChapter] Success, found:', lessons.length);
      return { data: lessons };
    } catch (error) {
      console.error('[lessonService.getLessonsByChapter] Error:', error);
      throw error;
    }
  },

  /**
   * Get a single lesson by ID
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {string} lessonId - Lesson ID
   * @returns Response with LessonResponseDto
   */
  getLessonById: async (courseId, chapterId, lessonId) => {
    try {
      console.log('[lessonService.getLessonById] Fetching lesson:', lessonId);
      const response = await api.get(
        `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
      );
      const lesson = response.data?.data || response.data;
      console.log('[lessonService.getLessonById] Success');
      return { data: lesson };
    } catch (error) {
      console.error('[lessonService.getLessonById] Error:', error);
      throw error;
    }
  },

  /**
   * Create a new lesson in a chapter
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {object} data - Lesson data { title, description, type, duration, freePreview, content?, videoUrl? }
   * @returns Response with LessonResponseDto
   */
  createLesson: async (courseId, chapterId, data) => {
    try {
      console.log('[lessonService.createLesson] Creating lesson for chapter:', chapterId);
      const response = await api.post(
        `/v1/courses/${courseId}/chapters/${chapterId}/lessons`,
        {
          title: data.title,
          description: data.description || '',
          type: data.type, // VIDEO, DOCUMENT, QUIZ, CODING, TEXT
          duration: data.duration || 0,
          freePreview: data.freePreview || false,
          content: data.content || '',
          videoUrl: data.videoUrl || '',
          videoPublicId: data.videoPublicId || '',
          quizId: data.quizId || null,
        }
      );
      const lesson = response.data?.data || response.data;
      console.log('[lessonService.createLesson] Success:', lesson.id);
      return { data: lesson };
    } catch (error) {
      console.error('[lessonService.createLesson] Error:', error);
      throw error;
    }
  },

  /**
   * Update a lesson
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {string} lessonId - Lesson ID
   * @param {object} data - Update data
   * @returns Response with updated LessonResponseDto
   */
  updateLesson: async (courseId, chapterId, lessonId, data) => {
    try {
      console.log('[lessonService.updateLesson] Updating lesson:', lessonId);
      const response = await api.put(
        `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`,
        {
          title: data.title,
          description: data.description || '',
          type: data.type,
          duration: data.duration || 0,
          freePreview: data.freePreview || false,
          content: data.content || '',
          videoUrl: data.videoUrl || '',
          videoPublicId: data.videoPublicId || '',
          quizId: data.quizId || null,
        }
      );
      const lesson = response.data?.data || response.data;
      console.log('[lessonService.updateLesson] Success');
      return { data: lesson };
    } catch (error) {
      console.error('[lessonService.updateLesson] Error:', error);
      throw error;
    }
  },

  /**
   * Delete a lesson
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {string} lessonId - Lesson ID
   * @returns Response
   */
  deleteLesson: async (courseId, chapterId, lessonId) => {
    try {
      console.log('[lessonService.deleteLesson] Deleting lesson:', lessonId);
      // Backend uses POST for delete
      const response = await api.post(
        `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}`
      );
      console.log('[lessonService.deleteLesson] Success');
      return { data: response.data?.data || response.data || { message: 'Xóa bài học thành công' } };
    } catch (error) {
      console.error('[lessonService.deleteLesson] Error:', error);
      throw error;
    }
  },

  /**
   * Upload video for a lesson
   * @param {string} courseId - Course ID
   * @param {string} chapterId - Chapter ID
   * @param {string} lessonId - Lesson ID
   * @param {File} file - Video file
   * @returns Response with LessonResponseDto containing video URL
   */
  uploadLessonVideo: async (courseId, chapterId, lessonId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('[lessonService.uploadLessonVideo] Uploading video for lesson:', lessonId);
      const response = await api.post(
        `/v1/courses/${courseId}/chapters/${chapterId}/lessons/${lessonId}/video`,
        formData
      );

      const lesson = response.data?.data || response.data;
      console.log('[lessonService.uploadLessonVideo] Success');
      return { data: lesson };
    } catch (error) {
      console.error('[lessonService.uploadLessonVideo] Error:', error);
      throw error;
    }
  },
};
