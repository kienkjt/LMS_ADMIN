import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import store from "./store/store";
import { ROUTES, ROLES } from "./utils/constants";

// Layouts
import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Common
import ProtectedRoute from "./components/common/ProtectedRoute";
import { PageLoader } from "./components/common/Loading";
import AuthInit from "./components/common/AuthInit";

// Auth Pages
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyOtp from "./components/auth/VerifyOtp";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

// Public Pages
import HomePage from "./pages/HomePage";
import CoursesPage from "./pages/CoursesPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentFailurePage from "./pages/PaymentFailurePage";
import PaymentPendingPage from "./pages/PaymentPendingPage";
import {
  NotFoundPage,
  UnauthorizedPage,
  ServerErrorPage,
} from "./pages/ErrorPages";

// Protected Pages (Lazy)
const StudentDashboard = lazy(() => import("./components/student/Dashboard"));
const InstructorDashboard = lazy(
  () => import("./components/instructor/Dashboard"),
);
const CoursesManagement = lazy(
  () => import("./components/instructor/CoursesManagement"),
);
const CreateCourse = lazy(() => import("./components/instructor/CreateCourse"));
const EditCourse = lazy(() => import("./components/instructor/EditCourse"));
const ChapterManagement = lazy(
  () => import("./components/instructor/ChapterManagement"),
);
const Cart = lazy(() => import("./components/cart/Cart"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const LearningPage = lazy(() => import("./pages/LearningPage"));
const ProfilePage = lazy(() => import("./components/common/Profile"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));

// Admin Pages (Lazy)
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./components/admin/AdminUsers"));
const AdminTeachers = lazy(() => import("./components/admin/AdminTeachers"));
const AdminCategories = lazy(() => import("./components/admin/AdminCategories"));
const AdminCourses = lazy(() => import("./components/admin/AdminCourses"));
const AdminWithdrawals = lazy(
  () => import("./components/admin/AdminWithdrawals"),
);
const AdminNotifications = lazy(
  () => import("./components/admin/AdminNotifications"),
);
const AdminOrders = lazy(() => import("./components/admin/AdminOrders"));
const AdminReviews = lazy(() => import("./components/admin/AdminReviews"));
import "./index.css";
import "./App.css";

// Wrappers
const WithMainLayout = ({ children }) => <MainLayout>{children}</MainLayout>;
const WithDashboard = ({ children }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthInit>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* ── Auth (no layout) ── */}
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtp />} />
              <Route
                path={ROUTES.FORGOT_PASSWORD}
                element={<ForgotPassword />}
              />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />

              {/* ── Public ── */}
              {/* ── Public ── */}
              <Route
                path={ROUTES.HOME}
                element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />}
              />
              <Route
                path={ROUTES.COURSES}
                element={
                  <WithMainLayout>
                    <CoursesPage />
                  </WithMainLayout>
                }
              />
              <Route
                path={ROUTES.COURSE_DETAIL}
                element={
                  <WithMainLayout>
                    <CourseDetailPage />
                  </WithMainLayout>
                }
              />
              <Route
                path={ROUTES.SEARCH}
                element={
                  <WithMainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <SearchPage />
                    </Suspense>
                  </WithMainLayout>
                }
              />

              {/* ── Cart ── */}
              <Route
                path={ROUTES.CART}
                element={
                  <WithMainLayout>
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <Suspense fallback={<PageLoader />}>
                        <Cart />
                      </Suspense>
                    </ProtectedRoute>
                  </WithMainLayout>
                }
              />

              {/* ── Checkout ── */}
              <Route
                path={ROUTES.CHECKOUT}
                element={
                  <WithMainLayout>
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <Suspense fallback={<PageLoader />}>
                        <CheckoutPage />
                      </Suspense>
                    </ProtectedRoute>
                  </WithMainLayout>
                }
              />

              {/* ── Payment Status Pages ── */}
              <Route
                path="/order/:orderId"
                element={
                  <WithMainLayout>
                    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                      <Suspense fallback={<PageLoader />}>
                        <OrderDetailPage />
                      </Suspense>
                    </ProtectedRoute>
                  </WithMainLayout>
                }
              />
              <Route
                path="/payment/success"
                element={
                  <WithMainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <PaymentSuccessPage />
                    </Suspense>
                  </WithMainLayout>
                }
              />
              <Route
                path="/payment/failure"
                element={
                  <WithMainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <PaymentFailurePage />
                    </Suspense>
                  </WithMainLayout>
                }
              />
              <Route
                path="/payment/pending"
                element={
                  <WithMainLayout>
                    <Suspense fallback={<PageLoader />}>
                      <PaymentPendingPage />
                    </Suspense>
                  </WithMainLayout>
                }
              />

              {/* ── Profile (STUDENT & INSTRUCTOR only) ── */}
              <Route
                path={ROUTES.PROFILE}
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.STUDENT, ROLES.INSTRUCTOR]}
                  >
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <ProfilePage />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />

              {/* ── Student ── */}
              <Route
                path={ROUTES.STUDENT_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <StudentDashboard />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.STUDENT_COURSES}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <StudentDashboard />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.STUDENT_ORDERS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <OrdersPage />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.WISHLIST}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <WishlistPage />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.STUDENT_CERTIFICATES}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <CertificatesPage />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />

              {/* ── Learning ── */}
              <Route
                path={ROUTES.LEARNING}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
                    <Suspense fallback={<PageLoader />}>
                      <LearningPage />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* ── Instructor ── */}
              <Route
                path={ROUTES.INSTRUCTOR_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <InstructorDashboard />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.INSTRUCTOR_COURSES}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <CoursesManagement />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.INSTRUCTOR_CREATE_COURSE}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <CreateCourse />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.INSTRUCTOR_EDIT_COURSE}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <EditCourse />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.INSTRUCTOR_CHAPTERS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.INSTRUCTOR]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <ChapterManagement />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />

              {/* ── Admin ── */}
              <Route
                path={ROUTES.ADMIN_DASHBOARD}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminDashboard />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_USERS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminUsers />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_TEACHERS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminTeachers />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_COURSES}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminCourses />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_CATEGORIES}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminCategories />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_WITHDRAWALS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminWithdrawals />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_NOTIFICATIONS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminNotifications />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
                path={ROUTES.ADMIN_ORDERS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminOrders />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
              <Route
              <Route
                path={ROUTES.ADMIN_REVIEWS}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <AdminReviews />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />
                path={ROUTES.ADMIN_PROFILE}
                element={
                  <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                    <WithDashboard>
                      <Suspense fallback={<PageLoader />}>
                        <ProfilePage />
                      </Suspense>
                    </WithDashboard>
                  </ProtectedRoute>
                }
              />

              {/* ── Errors ── */}
              <Route
                path={ROUTES.UNAUTHORIZED}
                element={<UnauthorizedPage />}
              />
              <Route path="/500" element={<ServerErrorPage />} />
              <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AuthInit>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ zIndex: 9999 }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
