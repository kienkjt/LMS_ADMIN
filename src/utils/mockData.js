// Mock Data Factory - Thay thế backend tạm thời
import { COURSE_LEVELS, COURSE_STATUS } from './constants';

// ========== MOCK USERS ==========
export const mockUsers = {
  student1: {
    id: 'user-1',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    name: 'Nguyễn Văn A',
    email: 'student@example.com',
    role: 'STUDENT',
    avatar: null,
    bio: 'Học viên chăm chỉ',
    phone: '0912345678',
  },
  teacher1: {
    id: 'user-2',
    firstName: 'Trần',
    lastName: 'Thị B',
    name: 'Trần Thị B',
    email: 'teacher@example.com',
    role: 'INSTRUCTOR',
    avatar: null,
    bio: 'Giảng viên Web Development',
    phone: '0987654321',
  },
};

// ========== MOCK CATEGORIES ==========
// Simulates backend response structure: GET /api/v1/categories
export const mockCategories = [
  { id: 1, name: 'Lập trình Web', description: 'Học web development', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 2, name: 'Lập trình Mobile', description: 'Học mobile development', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 3, name: 'Data Science', description: 'Học data science', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 4, name: 'Thiết kế UI/UX', description: 'Học thiết kế giao diện', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 5, name: 'Marketing Digital', description: 'Học digital marketing', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 6, name: 'Kinh doanh', description: 'Học quản lý kinh doanh', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 7, name: 'Tiếng Anh', description: 'Học tiếng anh', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
  { id: 8, name: 'Quản lý dự án', description: 'Học quản lý dự án', createdAt: '2024-01-01T00:00:00', updatedAt: '2024-01-01T00:00:00', createdById: 'user-1', updatedById: 'user-1' },
];

// ========== MOCK COURSES ==========
export const mockCourses = [
  {
    id: 'course-1',
    title: 'React.js - Từ cơ bản đến nâng cao',
    slug: 'reactjs-co-ban-nang-cao',
    description: 'Khóa học React.js đầy đủ từ cơ bản đến nâng cao. Học cách xây dựng ứng dụng web hiện đại với React.',
    categoryId: 1,
    category: { id: 1, name: 'Lập trình Web' },
    level: COURSE_LEVELS.BEGINNER,
    price: 299000,
    originalPrice: 599000,
    image: 'https://picsum.photos/400/225?random=1',
    instructor: mockUsers.teacher1,
    instructorId: 'user-2',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.8,
    reviews: 245,
    students: 1240,
    duration: '40 giờ',
    lessons: 120,
    videos: 95,
    resources: 50,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-10',
    content: [
      {
        id: 'section-1',
        title: 'Giới thiệu React',
        lessons: [
          { id: 'lesson-1', title: 'React là gì?', duration: 5, videoUrl: 'https://example.com/video1' },
          { id: 'lesson-2', title: 'Cài đặt môi trường', duration: 15, videoUrl: 'https://example.com/video2' },
          { id: 'lesson-3', title: 'Component cơ bản', duration: 30, videoUrl: 'https://example.com/video3' },
        ],
      },
      {
        id: 'section-2',
        title: 'Hooks trong React',
        lessons: [
          { id: 'lesson-4', title: 'useState Hook', duration: 20, videoUrl: 'https://example.com/video4' },
          { id: 'lesson-5', title: 'useEffect Hook', duration: 25, videoUrl: 'https://example.com/video5' },
          { id: 'lesson-6', title: 'Custom Hooks', duration: 30, videoUrl: 'https://example.com/video6' },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Vue.js 3 - Framework hiện đại',
    slug: 'vuejs-3-framework-hien-dai',
    description: 'Học Vue.js 3 với Composition API. Tạo ứng dụng web tương tác và hiệu suất cao.',
    categoryId: 1,
    category: { id: 1, name: 'Lập trình Web' },
    level: COURSE_LEVELS.INTERMEDIATE,
    price: 249000,
    originalPrice: 499000,
    image: 'https://picsum.photos/400/225?random=2',
    instructor: mockUsers.teacher1,
    instructorId: 'user-2',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.6,
    reviews: 180,
    students: 950,
    duration: '35 giờ',
    lessons: 110,
    videos: 85,
    resources: 45,
    createdAt: '2024-02-10',
    updatedAt: '2024-03-05',
    content: [],
  },
  {
    id: 'course-3',
    title: 'JavaScript ES6+ - Nâng cao',
    slug: 'javascript-es6-nang-cao',
    description: 'Khám phá các tính năng ES6+ trong JavaScript. Viết code JavaScript chuyên nghiệp.',
    categoryId: 1,
    category: { id: 1, name: 'Lập trình Web' },
    level: COURSE_LEVELS.ADVANCED,
    price: 199000,
    originalPrice: 399000,
    image: 'https://picsum.photos/400/225?random=3',
    instructor: mockUsers.teacher1,
    instructorId: 'user-2',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.9,
    reviews: 320,
    students: 2100,
    duration: '32 giờ',
    lessons: 100,
    videos: 78,
    resources: 40,
    createdAt: '2024-01-05',
    updatedAt: '2024-03-12',
    content: [],
  },
  {
    id: 'course-4',
    title: 'Python cho Data Science',
    slug: 'python-data-science',
    description: 'Sử dụng Python cho phân tích dữ liệu và Machine Learning.',
    categoryId: 3,
    category: { id: 3, name: 'Data Science' },
    level: COURSE_LEVELS.BEGINNER,
    price: 349000,
    originalPrice: 699000,
    image: 'https://picsum.photos/400/225?random=4',
    instructor: mockUsers.teacher1,
    instructorId: 'user-2',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.7,
    reviews: 210,
    students: 1500,
    duration: '48 giờ',
    lessons: 140,
    videos: 110,
    resources: 60,
    createdAt: '2024-01-20',
    updatedAt: '2024-03-08',
    content: [],
  },
];

// ========== MOCK ENROLLMENTS ==========
export const mockEnrollments = [
  {
    id: 'enroll-1',
    userId: 'user-1',
    courseId: 'course-1',
    course: mockCourses[0],
    enrolledAt: '2024-02-01',
    completedAt: null,
    certificateIssued: false,
    progress: 45,
    lastAccessedAt: '2024-03-20',
  },
  {
    id: 'enroll-2',
    userId: 'user-1',
    courseId: 'course-2',
    course: mockCourses[1],
    enrolledAt: '2024-02-15',
    completedAt: '2024-03-10',
    certificateIssued: true,
    progress: 100,
    lastAccessedAt: '2024-03-10',
  },
  {
    id: 'enroll-3',
    userId: 'user-1',
    courseId: 'course-3',
    course: mockCourses[2],
    enrolledAt: '2024-03-01',
    completedAt: null,
    certificateIssued: false,
    progress: 20,
    lastAccessedAt: '2024-03-22',
  },
];

// ========== MOCK INSTRUCTOR COURSES ==========
export const mockInstructorCourses = [
  {
    id: 'course-1',
    title: 'React.js - Từ cơ bản đến nâng cao',
    slug: 'reactjs-co-ban-nang-cao',
    description: 'Khóa học React.js đầy đủ từ cơ bản đến nâng cao.',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.8,
    reviews: 245,
    totalStudents: 1240,
    revenue: 370.3,
    image: 'https://picsum.photos/400/225?random=1',
    createdAt: '2024-01-15',
  },
  {
    id: 'course-2',
    title: 'Vue.js 3 - Framework hiện đại',
    slug: 'vuejs-3-framework-hien-dai',
    description: 'Học Vue.js 3 với Composition API.',
    status: COURSE_STATUS.PUBLISHED,
    rating: 4.6,
    reviews: 180,
    totalStudents: 950,
    revenue: 236.7,
    image: 'https://picsum.photos/400/225?random=2',
    createdAt: '2024-02-10',
  },
  {
    id: 'course-draft-1',
    title: 'Node.js - Backend Development',
    slug: 'nodejs-backend-development',
    description: 'Xây dựng backend API với Node.js.',
    status: COURSE_STATUS.DRAFT,
    rating: 0,
    reviews: 0,
    totalStudents: 0,
    revenue: 0,
    image: 'https://picsum.photos/400/225?random=10',
    createdAt: '2024-03-15',
  },
];

// ========== MOCK REVIEWS ==========
export const mockReviews = [
  {
    id: 1,
    userId: 'user-1',
    userName: 'Nguyễn Văn A',
    courseId: 'course-1',
    rating: 5,
    title: 'Khóa học tuyệt vời!',
    content: 'Giảng dạy rất rõ ràng và dễ hiểu. Tôi đã học được rất nhiều từ khóa học này.',
    createdAt: '2024-03-15',
  },
  {
    id: 2,
    userId: 'user-7',
    userName: 'Trần Thị C',
    courseId: 'course-1',
    rating: 4,
    title: 'Rất tốt',
    content: 'Nội dung hay, chỉ mong có thêm bài tập thực hành.',
    createdAt: '2024-03-10',
  },
];

// ========== MOCK WISHLIST ==========
export const mockWishlist = [
  {
    id: 'wishlist-1',
    userId: 'user-1',
    courseId: 'course-4',
    course: mockCourses[3],
    addedAt: '2024-03-15',
  },
];

// ========== MOCK CART ==========
export const mockCart = [];

// ========== MOCK STATS ==========
export const mockStudentStats = {
  enrolledCourses: 3,
  completedCourses: 1,
  certificates: 1,
  totalLearningHours: 45,
};

export const mockInstructorStats = {
  totalCourses: 3,
  publishedCourses: 2,
  draftCourses: 1,
  totalStudents: 3190,
  totalReviews: 245,
  averageRating: 4.7,
  totalRevenue: 607,
};
