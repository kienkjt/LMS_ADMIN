# EduLearn LMS - Frontend (Simplified for 2 Roles)

## 📋 Giới thiệu

Đây là phiên bản đơn giản của EduLearn LMS Frontend dành cho **2 roles**:

- **Student (Học viên)**
- **Instructor/Teacher (Giảng viên)**

**Admin role đã được xóa**. Tất cả dữ liệu được quản lý bằng **Mock Data** thay vì API Backend (tạm thời).

---

## 🚀 Bắt Đầu Nhanh

### Cài Đặt

```bash
cd lms-fe
npm install
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

---

## 🔐 Test Credentials

### Student (Học viên)

```
Email: student@example.com
Password: password
```

### Teacher (Giảng viên)

```
Email: teacher@example.com
Password: password
```

> **Ghi chú**: Credentials này có sẵn trên trang Login hoặc bạn có thể đăng ký tài khoản mới.

---

## 📱 Cấu Trúc Dự Án

```
src/
├── components/
│   ├── admin/          (REMOVED - Xóa hết)
│   ├── auth/           (Login, Register, etc.)
│   ├── common/         (Navbar, Footer, etc.)
│   ├── student/        (Student Dashboard)
│   ├── instructor/     (Instructor Dashboard, CoursesManagement, CreateCourse)
│   └── cart/           (Cart)
├── pages/
│   ├── HomePage.jsx
│   ├── CoursesPage.jsx
│   ├── CourseDetailPage.jsx
│   ├── LearningPage.jsx    (NEW - Trang học khóa học)
│   └── SearchPage.jsx
├── services/           (Mock Services - Không API)
│   ├── authService.js
│   ├── courseService.js
│   ├── enrollmentService.js
│   ├── cartService.js
│   ├── wishlistService.js
│   └── categoryService.js
├── store/
│   └── Redux slices (auth, cart, etc.)
└── utils/
    ├── constants.js    (Updated - Chỉ có 2 roles)
    ├── mockData.js     (NEW - Mock data factory)
    └── helpers.js
```

---

## ✨ Tính Năng Chính

### 👨‍🎓 Cho Học Viên (Student)

- ✅ Đăng ký / Đăng nhập
- ✅ Xem danh sách khóa học
- ✅ Tìm kiếm khóa học theo danh mục, giá, mức độ
- ✅ Xem chi tiết khóa học
- ✅ Thêm khóa học vào giỏ hàng
- ✅ Thêm khóa học vào wishlist (yêu thích)
- ✅ Dashboard cá nhân (xem khóa học đang học, hoàn thành, chứng chỉ)
- ✅ Trang học (LearningPage) với video player UI
- ✅ Tracking tiến độ học

### 👨‍🏫 Cho Giảng Viên (Teacher/Instructor)

- ✅ Đăng ký / Đăng nhập
- ✅ Dashboard giảng viên (thống kê khóa học, học sinh)
- ✅ Quản lý khóa học (Xem, sửa, xóa, công khai)
- ✅ Tạo khóa học mới
- ✅ [TODO] Sửa khóa học
- ✅ [TODO] Quản lý bài học / video
- ✅ [TODO] Xem thống kê chi tiết
- ✅ [TODO] Quản lý review / rating

---

## 🛠️ Tech Stack

- **React 19** - UI Library
- **React Router 7** - Navigation
- **Redux Toolkit** - State Management
- **React Hook Form** - Form Handling
- **React Toastify** - Notifications
- **Vite** - Build Tool
- **CSS3** - Styling

---

## 📦 Mock Data

Tất cả dữ liệu giả (mock) được định nghĩa trong `src/utils/mockData.js`:

```javascript
// MockData bao gồm:
- mockUsers (student1, teacher1)
- mockCourses (4 khóa học mẫu)
- mockCategories (8 danh mục)
- mockEnrollments (Đơn đăng ký)
- mockWishlist (Danh sách yêu thích)
- mockCart (Giỏ hàng)
- mockStats (Thống kê)
```

**Tất cả service** (`authService`, `courseService`, etc.) được update để sử dụng mock data thay vì API call.

---

## 🔄 Các Thay Đổi Chính

### ❌ Xóa

- Admin role, dashboard, routes, navigation
- Tất cả admin-related code

### ✅ Thêm

- Mock data factory (`mockData.js`)
- Learning page cho sinh viên
- Courses management page cho giáo viên
- Create course page cho giáo viên
- Mock services (không còn API calls)

### 🔧 Cập nhật

- `constants.js`: Chỉ 2 roles (STUDENT, INSTRUCTOR)
- `App.jsx`: Xóa admin routes, thêm learning route
- `authService.js`: Mock login/register
- `courseService.js`: Mock CRUD operations
- `enrollmentService.js`, `cartService.js`, v.v.

---

## 🎯 Chức Năng Chính

### Sidebar Navigation

Dựa trên role, sidebar hiển thị menu khác nhau:

**Student**: Dashboard → Khóa học → Yêu thích → Giỏ hàng → Hồ sơ

**Teacher**: Dashboard → Quản lý khóa học → Tạo khóa học → Hồ sơ

---

## 🧪 Testing

### Đăng nhập thử

1. Vào `/login`
2. Dùng credentials test ở trên
3. Chọn role (student hoặc teacher) dựa theo email

### Workflow Student

1. Login với `student@example.com`
2. Dashboard → Xem khóa học đang học
3. Vào "Khám phá khóa học" → Xem danh sách khóa học
4. Chọn khóa học → Xem chi tiết
5. Thêm vào giỏ hàng hoặc yêu thích (wishlist)
6. Nhấn "Bắt đầu học" → Vào Learning Page

### Workflow Teacher

1. Login với `teacher@example.com`
2. Dashboard → Xem khóa học của tôi (3 khóa học mẫu)
3. Vào "Quản lý khóa học" → Xem danh sách
4. Tạo khóa học mới → Fill form → Submit
5. Công khai khóa học từ danh sách

---

## 📝 Ghi Chú

- **No Backend Required**: Tất cả data là mock, ko cần backend server
- **localStorage**: Dữ liệu test user được lưu trong localStorage
- **setTimeout**: Service gọi dùng delay để giả lập async calls
- **Data Persistence trong Session**: Mock data lưu trong memory (reset khi reload page)

---

## 🐛 Known Issues

1. **useEffect Dependencies**: Có 2 lỗi warning về dependencies (không ảnh hưởng runtime)
2. **Mock Data Reset**: Data mock sẽ reset khi reload page (không persistent)
3. **Edit Course**: Trang sửa khóa học chưa được tạo

---

## 🚀 Next Steps / TODO

- [ ] Tạo trang sửa khóa học (EditCourse)
- [ ] Thêm Upload image/video cho khóa học
- [ ] Xây dựng Learning Page hoàn chỉnh với video player
- [ ] Thêm Discussion/Comment cho khóa học
- [ ] Integrating real Backend API
- [ ] Thêm Payment gateway (Stripe/Zalopay)
- [ ] Deploy lên production

---

## 📄 License

MIT License

---

## 👨‍💻 Hỗ Trợ

Nếu có vấn đề, xin vui lòng liên hệ hoặc tạo issue.

**Happy Learning! 🎓**
