# LMS - API Guide cho Admin

## Mục lục
1. [Authentication (Xác thực)](#authentication)
2. [User Management (Quản lý người dùng)](#user-management)
3. [Category Management (Quản lý danh mục)](#category-management)
4. [Course Management (Quản lý khóa học)](#course-management)
5. [Withdrawal Management (Quản lý rút tiền)](#withdrawal-management)
6. [General Notes (Lưu ý chung)](#general-notes)

---

## Authentication

### 1. Register (Đăng ký)
**Endpoint:** `POST /v1/auth/register`

**Input:**
```json
{
  "email": "admin@lms.com",
  "password": "Admin@123456",
  "fullName": "Admin User",
  "role": "ADMIN"
}
```

**Validation Rules:**
- `email`: Bắt buộc, định dạng email hợp lệ
- `password`: Bắt buộc, tối thiểu 8 ký tự, phải chứa:
  - Ít nhất 1 chữ cái hoa (A-Z)
  - Ít nhất 1 chữ cái thường (a-z)
  - Ít nhất 1 chữ số (0-9)
  - Ít nhất 1 ký tự đặc biệt (@$!%*?&)
- `fullName`: Bắt buộc, tối thiểu 2 ký tự
- `role`: Bắt buộc, chỉ nhận "STUDENT" hoặc "INSTRUCTOR" (Admin không được tạo qua API này)

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email của bạn để lấy OTP."
}
```

**Lưu ý:**
- OTP sẽ được gửi đến email của người dùng
- Email sẽ được xác nhận khi người dùng nhập OTP chính xác
- Nếu email đã tồn tại nhưng chưa xác nhận, hệ thống sẽ gửi lại OTP

---

### 2. Login (Đăng nhập)
**Endpoint:** `POST /v1/auth/login`

**Input:**
```json
{
  "email": "admin@lms.com",
  "password": "Admin@123456"
}
```

**Validation Rules:**
- `email`: Bắt buộc, định dạng email hợp lệ
- `password`: Bắt buộc, tối thiểu 8 ký tự với yêu cầu như trên

**Output:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "role": "ADMIN",
    "message": "Đăng nhập thành công"
  },
  "message": "Đăng nhập thành công"
}
```

**Lưu ý:**
- `accessToken`: Dùng cho các request tiếp theo (gửi trong header `Authorization: Bearer <accessToken>`)
- `refreshToken`: Dùng để lấy `accessToken` mới khi hết hạn
- `expiresIn`: Thời gian hết hạn của token (tính bằng milliseconds)
- Chỉ có thể login nếu email đã được xác nhận (verify OTP)

---

### 3. Verify OTP (Xác nhận OTP)
**Endpoint:** `POST /v1/auth/verify-otp`

**Input:**
```json
{
  "email": "admin@lms.com",
  "otp": "123456"
}
```

**Validation Rules:**
- `email`: Bắt buộc, định dạng email hợp lệ
- `otp`: Bắt buộc, phải là 6 chữ số

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Email xác nhận thành công"
}
```

**Lưu ý:**
- OTP hợp lệ trong 10 phút
- Sau khi verify thành công, có thể login

---

### 4. Logout (Đăng xuất)
**Endpoint:** `POST /v1/auth/logout`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Đăng xuất thành công"
}
```

---

### 5. Refresh Token
**Endpoint:** `POST /v1/auth/refresh-token`

**Input:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "role": "ADMIN"
  }
}
```

---

### 6. Forgot Password (Quên mật khẩu)
**Endpoint:** `POST /v1/auth/forgot-password`

**Input:**
```json
{
  "email": "admin@lms.com"
}
```

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Vui lòng kiểm tra email của bạn để lấy OTP"
}
```

**Lưu ý:**
- OTP sẽ được gửi đến email
- Sử dụng OTP này với endpoint `/verify-reset-otp`

---

### 7. Verify Reset OTP
**Endpoint:** `POST /v1/auth/verify-reset-otp`

**Input:**
```json
{
  "email": "admin@lms.com",
  "otp": "123456"
}
```

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "OTP xác nhận thành công"
}
```

---

### 8. Reset Password (Đặt lại mật khẩu)
**Endpoint:** `POST /v1/auth/reset-password`

**Input:**
```json
{
  "email": "admin@lms.com",
  "newPassword": "NewAdmin@123456"
}
```

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Mật khẩu đã được thay đổi thành công"
}
```

**Lưu ý:**
- Phải verify OTP trước khi reset password
- Mật khẩu mới phải tuân theo quy tắc validation

---

## User Management

### 1. Get Profile (Lấy thông tin cá nhân)
**Endpoint:** `GET /v1/user/profile`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@lms.com",
    "fullName": "Admin User",
    "avatar": "https://cloudinary.com/...",
    "bio": "Admin description",
    "phone": "+84901234567",
    "role": "ADMIN",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:00:00"
  },
  "message": null
}
```

---

### 2. Update Profile (Cập nhật thông tin cá nhân)
**Endpoint:** `PUT /v1/user/profile`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Input:**
```json
{
  "fullName": "Admin Updated",
  "bio": "New admin bio",
  "phone": "+84909876543"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@lms.com",
    "fullName": "Admin Updated",
    "avatar": "https://cloudinary.com/...",
    "bio": "New admin bio",
    "phone": "+84909876543",
    "role": "ADMIN",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Cập nhật hồ sơ thành công"
}
```

---

### 3. Upload Avatar (Tải lên ảnh đại diện)
**Endpoint:** `POST /v1/user/avatar`

**Required Header:**
```
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

**Input:**
- `file`: File ảnh (JPG, PNG, GIF, tối đa 5MB)

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@lms.com",
    "fullName": "Admin User",
    "avatar": "https://cloudinary.com/...new-avatar.jpg",
    "bio": "Admin description",
    "phone": "+84901234567",
    "role": "ADMIN",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Avatar tải lên thành công"
}
```

---

### 4. Delete Avatar (Xóa ảnh đại diện)
**Endpoint:** `DELETE /v1/user/avatar`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@lms.com",
    "fullName": "Admin User",
    "avatar": null,
    "bio": "Admin description",
    "phone": "+84901234567",
    "role": "ADMIN",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Avatar đã được xóa thành công"
}
```

---

### 5. Change Password (Đổi mật khẩu)
**Endpoint:** `POST /v1/user/change-password`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Input:**
```json
{
  "currentPassword": "Admin@123456",
  "newPassword": "NewAdmin@123456"
}
```

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Mật khẩu đã được thay đổi thành công"
}
```

**Lưu ý:**
- Mật khẩu hiện tại phải chính xác
- Mật khẩu mới phải khác mật khẩu cũ
- Mật khẩu mới phải tuân theo quy tắc validation

---

## Category Management

### 1. Create Category (Tạo danh mục)
**Endpoint:** `POST /v1/categories`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin only

**Input:**
```json
{
  "name": "Web Development",
  "description": "Khóa học về phát triển web"
}
```

**Validation Rules:**
- `name`: Bắt buộc, không được để trống
- `description`: Tùy chọn

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Web Development",
    "description": "Khóa học về phát triển web",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:00:00",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "updatedById": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Danh mục được tạo thành công"
}
```

---

### 2. Get Category by ID (Lấy danh mục theo ID)
**Endpoint:** `GET /v1/categories/{categoryId}`

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Web Development",
    "description": "Khóa học về phát triển web",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:00:00",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "updatedById": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": null
}
```

---

### 3. Get Categories (Lấy danh sách danh mục)
**Endpoint:** `GET /v1/categories`

**Query Parameters:**
- `keyword` (optional): Tìm kiếm theo tên
- `page` (default: 1): Trang (bắt đầu từ 1)
- `pageSize` (default: 10): Số lượng items trên mỗi trang

**Example URL:** `GET /v1/categories?keyword=Web&page=1&pageSize=10`

**Output:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Web Development",
        "description": "Khóa học về phát triển web",
        "createdAt": "2026-04-30T10:00:00",
        "updatedAt": "2026-04-30T10:00:00",
        "createdById": "550e8400-e29b-41d4-a716-446655440000",
        "updatedById": "550e8400-e29b-41d4-a716-446655440000"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "isLast": true,
    "hasContent": true
  },
  "message": null
}
```

---

### 4. Update Category (Cập nhật danh mục)
**Endpoint:** `PUT /v1/categories/{categoryId}`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin only

**Input:**
```json
{
  "name": "Web Development Updated",
  "description": "Khóa học về phát triển web - cập nhật"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Web Development Updated",
    "description": "Khóa học về phát triển web - cập nhật",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00",
    "createdById": "550e8400-e29b-41d4-a716-446655440000",
    "updatedById": "550e8400-e29b-41d4-a716-446655440000"
  },
  "message": "Danh mục được cập nhật thành công"
}
```

---

### 5. Delete Category (Xóa danh mục)
**Endpoint:** `DELETE /v1/categories/{categoryId}`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin only

**Output:**
```json
{
  "success": true,
  "data": null,
  "message": "Danh mục được xóa thành công"
}
```

**Lưu ý:**
- Không thể xóa danh mục đang có khóa học
- Xóa mềm (soft delete), dữ liệu vẫn lưu trong DB nhưng không hiển thị

---

## Course Management

### 1. Approve Course (Phê duyệt khóa học)
**Endpoint:** `POST /v1/courses/{courseId}/approve`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin only

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Learn JavaScript",
    "description": "Complete JavaScript course",
    "price": 999000,
    "instructorId": "550e8400-e29b-41d4-a716-446655440003",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "APPROVED",
    "level": "BEGINNER",
    "duration": 40,
    "thumbnail": "https://cloudinary.com/...",
    "previewVideo": "https://cloudinary.com/...",
    "isPublished": false,
    "isActive": true,
    "studentCount": 0,
    "avgRating": 0,
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Khóa học được phê duyệt thành công"
}
```

---

### 2. Reject Course (Từ chối khóa học)
**Endpoint:** `POST /v1/courses/{courseId}/reject`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin only

**Input:**
```json
{
  "reason": "Nội dung không phù hợp với chính sách của nền tảng"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "title": "Learn JavaScript",
    "description": "Complete JavaScript course",
    "price": 999000,
    "instructorId": "550e8400-e29b-41d4-a716-446655440003",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "status": "REJECTED",
    "rejectionReason": "Nội dung không phù hợp với chính sách của nền tảng",
    "level": "BEGINNER",
    "duration": 40,
    "thumbnail": "https://cloudinary.com/...",
    "previewVideo": "https://cloudinary.com/...",
    "isPublished": false,
    "isActive": true,
    "studentCount": 0,
    "avgRating": 0,
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Khóa học bị từ chối thành công"
}
```

---

### 3. Search Managed Courses (Tìm kiếm khóa học để quản lý)
**Endpoint:** `POST /v1/courses/management/search`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Instructor, Admin

**Query Parameters:**
- `page` (default: 1): Trang (bắt đầu từ 1)
- `pageSize` (default: 10): Số lượng items trên mỗi trang

**Input (Body):**
```json
{
  "keyword": "JavaScript",
  "status": "PENDING",
  "level": "BEGINNER",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "title": "Learn JavaScript",
        "description": "Complete JavaScript course",
        "price": 999000,
        "instructorId": "550e8400-e29b-41d4-a716-446655440003",
        "categoryId": "550e8400-e29b-41d4-a716-446655440001",
        "status": "APPROVED",
        "level": "BEGINNER",
        "duration": 40,
        "thumbnail": "https://cloudinary.com/...",
        "previewVideo": "https://cloudinary.com/...",
        "isPublished": false,
        "isActive": true,
        "studentCount": 0,
        "avgRating": 0,
        "createdAt": "2026-04-30T10:00:00",
        "updatedAt": "2026-04-30T10:35:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "isLast": true,
    "hasContent": true
  },
  "message": null
}
```

---

## Withdrawal Management

### 1. Get Withdrawal Request (Lấy yêu cầu rút tiền)
**Endpoint:** `GET /v1/withdrawal/request/{requestId}`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Instructor, Admin

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "instructorId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 500000,
    "bankName": "Vietcombank",
    "bankAccountNumber": "0123456789",
    "bankAccountHolder": "Nguyen Van A",
    "status": "PENDING",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:00:00"
  },
  "message": null
}
```

---

### 2. Get All Withdrawal Requests (Lấy tất cả yêu cầu rút tiền)
**Endpoint:** `GET /v1/withdrawal/requests`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin

**Query Parameters:**
- `status` (optional): PENDING, APPROVED, REJECTED
- `page` (default: 1): Trang (bắt đầu từ 1)
- `pageSize` (default: 10): Số lượng items trên mỗi trang

**Example URL:** `GET /v1/withdrawal/requests?status=PENDING&page=1&pageSize=10`

**Output:**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "instructorId": "550e8400-e29b-41d4-a716-446655440003",
        "instructorName": "John Doe",
        "amount": 500000,
        "bankName": "Vietcombank",
        "bankAccountNumber": "0123456789",
        "bankAccountHolder": "Nguyen Van A",
        "status": "PENDING",
        "createdAt": "2026-04-30T10:00:00",
        "updatedAt": "2026-04-30T10:00:00"
      }
    ],
    "pageNumber": 1,
    "pageSize": 10,
    "totalElements": 1,
    "totalPages": 1,
    "isLast": true,
    "hasContent": true
  },
  "message": null
}
```

---

### 3. Approve Withdrawal Request (Phê duyệt yêu cầu rút tiền)
**Endpoint:** `POST /v1/withdrawal/request/{requestId}/approve`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "instructorId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 500000,
    "bankName": "Vietcombank",
    "bankAccountNumber": "0123456789",
    "bankAccountHolder": "Nguyen Van A",
    "status": "APPROVED",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Yêu cầu rút tiền được phê duyệt thành công"
}
```

---

### 4. Reject Withdrawal Request (Từ chối yêu cầu rút tiền)
**Endpoint:** `POST /v1/withdrawal/request/{requestId}/reject`

**Required Header:**
```
Authorization: Bearer <accessToken>
```

**Permission:** Admin

**Input:**
```json
{
  "reason": "Thông tin tài khoản ngân hàng không chính xác"
}
```

**Output:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "instructorId": "550e8400-e29b-41d4-a716-446655440003",
    "amount": 500000,
    "bankName": "Vietcombank",
    "bankAccountNumber": "0123456789",
    "bankAccountHolder": "Nguyen Van A",
    "status": "REJECTED",
    "rejectionReason": "Thông tin tài khoản ngân hàng không chính xác",
    "createdAt": "2026-04-30T10:00:00",
    "updatedAt": "2026-04-30T10:35:00"
  },
  "message": "Yêu cầu rút tiền bị từ chối thành công"
}
```

---

## General Notes

### Headers (Tiêu đề yêu cầu)

**Tất cả các request yêu cầu authentication phải bao gồm:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### Response Format (Định dạng phản hồi)

**Success Response:**
```json
{
  "success": true,
  "data": {},
  "message": "Thành công"
}
```

**Error Response:**
```json
{
  "success": false,
  "data": null,
  "message": "Chi tiết lỗi"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Thành công |
| 201 | CREATED - Tạo thành công |
| 400 | BAD_REQUEST - Yêu cầu không hợp lệ |
| 401 | UNAUTHORIZED - Không được phép (cần đăng nhập) |
| 403 | FORBIDDEN - Bị cấm (không có quyền) |
| 404 | NOT_FOUND - Không tìm thấy tài nguyên |
| 409 | CONFLICT - Xung đột (ví dụ: email đã tồn tại) |
| 500 | INTERNAL_SERVER_ERROR - Lỗi server |

### Pagination (Phân trang)

Tất cả các endpoint trả về danh sách đều hỗ trợ phân trang:

- `page`: Số trang (bắt đầu từ 1), default là 1
- `pageSize`: Số lượng items trên mỗi trang, default là 10

**Response Structure:**
```json
{
  "content": [...],          // Danh sách items
  "pageNumber": 1,           // Trang hiện tại
  "pageSize": 10,            // Số lượng items trên mỗi trang
  "totalElements": 100,      // Tổng số items
  "totalPages": 10,          // Tổng số trang
  "isLast": false,           // Đây có phải trang cuối không?
  "hasContent": true         // Có dữ liệu không?
}
```

### Error Handling (Xử lý lỗi)

**Validation Error Example:**
```json
{
  "success": false,
  "data": null,
  "message": "Email không hợp lệ"
}
```

**Authentication Error Example:**
```json
{
  "success": false,
  "data": null,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}
```

**Authorization Error Example:**
```json
{
  "success": false,
  "data": null,
  "message": "Bạn không có quyền truy cập tài nguyên này"
}
```

### Best Practices (Các quy tắc tốt nhất)

1. **Token Management:**
   - Lưu `accessToken` và `refreshToken` an toàn (localStorage, sessionStorage hoặc cookie)
   - Gửi `accessToken` trong header `Authorization: Bearer <token>` cho mỗi request
   - Khi token hết hạn, sử dụng `refreshToken` để lấy token mới
   - Đăng xuất khi người dùng thoát hoặc token không còn hợp lệ

2. **Error Handling:**
   - Kiểm tra `success` flag trong response
   - Xử lý các error codes khác nhau (401, 403, 404, 500, etc.)
   - Hiển thị `message` cho người dùng để giải thích lỗi

3. **API Calls:**
   - Sử dụng HTTPS trong production
   - Áp dụng rate limiting để tránh abuse
   - Cache dữ liệu nếu có thể để giảm số lượng request
   - Sử dụng loading state khi gọi API

4. **Security:**
   - Không lưu password
   - Luôn validate input trước khi gửi
   - Sử dụng CSRF tokens nếu cần
   - Kiểm tra quyền trước khi thực hiện hành động

### API Base URL

- **Development:** `http://localhost:8080`
- **Production:** `https://api.lms.com` (cần update khi deploy)

---

## Lưu ý cho Frontend Developer

1. **Implement Loading States:** Hiển thị spinner/loader khi đang gọi API
2. **Implement Error Messages:** Hiển thị thông báo lỗi từ server cho người dùng
3. **Token Refresh Logic:** Tự động refresh token khi sắp hết hạn
4. **Form Validation:** Validate input trước khi submit form
5. **Confirmation Dialogs:** Xin xác nhận trước khi thực hiện hành động nguy hiểm (xóa, từ chối, etc.)
6. **Search/Filter UX:** Cung cấp debouncing cho search để giảm số lượng API calls
7. **Responsive Design:** Thiết kế mobile-friendly cho tất cả các UI

---

**Cập nhật lần cuối:** 30/04/2026
**Phiên bản API:** 1.0.0

