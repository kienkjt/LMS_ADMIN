/**
 * I18N Error Handling Guide
 * 
 * ## How to use:
 * 
 * ### 1. Backend Response Format (Recommended)
 * 
 * Error response:
 * {
 *   "success": false,
 *   "errorKey": "USER_NOT_FOUND",
 *   "params": { "id": 123 }
 * }
 * 
 * Success response:
 * {
 *   "success": true,
 *   "successKey": "LOGIN_SUCCESS"
 * }
 * 
 * ### 2. Frontend Usage Examples
 * 
 * #### Example 1: In a service file
 * ```javascript
 * import { authService } from '../services/authService';
 * import { handleApiError, handleApiSuccess } from '../utils/errorHandler';
 * import { toast } from 'react-toastify';
 * 
 * try {
 *   const response = await authService.login(email, password);
 *   const successMsg = handleApiSuccess(response);
 *   toast.success(successMsg);
 * } catch (error) {
 *   const errorMsg = handleApiError(error);
 *   toast.error(errorMsg);
 * }
 * ```
 * 
 * #### Example 2: In a component
 * ```javascript
 * import { handleApiError, getErrorMessageByCode } from '../utils/errorHandler';
 * import { toast } from 'react-toastify';
 * 
 * const handleFormSubmit = async (formData) => {
 *   try {
 *     const response = await api.post('/api/v1/courses', formData);
 *     toast.success('Khóa học đã được tạo!');
 *   } catch (error) {
 *     const errorMsg = handleApiError(error);
 *     toast.error(errorMsg);
 *   }
 * };
 * ```
 * 
 * #### Example 3: Direct error code to message conversion
 * ```javascript
 * import { getErrorMessageByCode } from '../utils/errorHandler';
 * 
 * const errorMsg = getErrorMessageByCode('USER_NOT_FOUND', { id: 123 });
 * // Returns: "User not found" or fallback message
 * ```
 * 
 * ### 3. How it works:
 * 
 * 1. Frontend sends Accept-Language header with every request
 *    - Tells backend which language to use
 * 
 * 2. Backend returns errorKey/successKey instead of message
 *    - More flexible, allows client-side caching
 *    - Multiple clients can have different languages
 * 
 * 3. Frontend uses errorHandler to translate error keys
 *    - Looks up translation from i18n files
 *    - Falls back to error code if translation not found
 *    - Handles parameter substitution
 * 
 * ### 4. Adding new error/success messages:
 * 
 * 1. Add key to src/i18n/locales/vi.json:
 *    ```json
 *    {
 *      "errors": {
 *        "CUSTOM_ERROR": "Tùy chỉnh lỗi"
 *      }
 *    }
 *    ```
 * 
 * 2. Add same key to src/i18n/locales/en.json:
 *    ```json
 *    {
 *      "errors": {
 *        "CUSTOM_ERROR": "Custom error"
 *      }
 *    }
 *    ```
 * 
 * 3. Backend returns this key:
 *    ```json
 *    {
 *      "errorKey": "CUSTOM_ERROR"
 *    }
 *    ```
 * 
 * ### 5. Parameter substitution:
 * 
 * With parameters in error message:
 * ```json
 * "INVALID_EMAIL": "Email {{email}} không hợp lệ"
 * ```
 * 
 * Backend response:
 * ```json
 * {
 *   "errorKey": "INVALID_EMAIL",
 *   "params": { "email": "test@example.com" }
 * }
 * ```
 * 
 * Frontend output:
 * ```
 * "Email test@example.com không hợp lệ"
 * ```
 * 
 * ### 6. Current API interceptor behavior:
 * 
 * - Automatically adds Accept-Language header to all requests
 * - Logs error messages in console with i18n translation
 * - Can be used with handleApiError for consistent error handling
 * - Supports HTTP status code fallbacks
 */

export const I18N_GUIDE = 'Check the comments in this file for complete usage guide';
