import { mockCategories } from '../utils/mockData';
import api from './api'; // API instance sẽ được tạo khi backend sẵn sàng

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extract only necessary fields from category response
 * 
 * Backend trả về: { id (UUID), name, description, createdAt, updatedAt, createdById, updatedById }
 * Frontend cần: { id, name }
 * 
 * Tối ưu hóa: Giảm payload cho filter list
 */
const extractCategoryName = (category) => {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
  };
};

export const categoryService = {
  /**
   * Get all categories
   * 
   * API endpoint: GET /v1/categories
   * Query params: keyword (optional), page (default 0), size (default 20)
   * Response: APIResponse<Page<CategoryResponseDto>>
   *   - data.content: CategoryResponseDto[]
   *   - data.totalElements: number
   * 
   * Frontend extract: {id, name} only
   */
  getAll: async () => {
    try {
      console.log('[categoryService.getAll] Fetching categories from backend API...');
      // Get all categories in one page (size=100 to get most categories)
      const response = await api.get('/v1/categories?size=100');

      console.log('[categoryService.getAll] Raw response:', response);

      // Handle response wrapping: response.data could be either:
      // 1. { statusCode, message, data: { content: [...] } } - wrapped by backend
      // 2. { content: [...] } - Spring Data Page format
      const pageData = response.data?.data || response.data;
      const categories = pageData?.content || [];

      console.log('[categoryService.getAll] Categories:', categories);

      // Extract only id + name
      const optimizedCategories = (Array.isArray(categories) ? categories : []).map(extractCategoryName);

      console.log('[categoryService.getAll] Optimized:', optimizedCategories);
      return { data: optimizedCategories };
    } catch (error) {
      console.error('[categoryService.getAll] API error, falling back to mock data:', error);
      // Fallback to mock data if API fails
      const optimizedCategories = mockCategories.map(extractCategoryName);
      return { data: optimizedCategories };
    }
  },

  /**
   * Get category by ID
   * 
   * API endpoint: GET /v1/categories/{categoryId}
   * Response: APIResponse<CategoryResponseDto>
   * Frontend extract: id + name only
   */
  getById: async (id) => {
    try {
      console.log('[categoryService.getById] Fetching category:', id);
      const response = await api.get(`/v1/categories/${id}`);

      // Handle response: response.data could be { statusCode, data: {...} } or direct CategoryResponseDto
      const category = response.data?.data || response.data;

      console.log('[categoryService.getById] Response:', category);
      return { data: extractCategoryName(category) };
    } catch (error) {
      console.error('[categoryService.getById] API error, falling back to mock data:', error);
      // Fallback to mock data if API fails
      const category = mockCategories.find(c => c.id === id);
      if (!category) {
        throw { response: { status: 404, data: { message: 'Danh mục không tìm thấy' } } };
      }
      return { data: extractCategoryName(category) };
    }
  },
};
