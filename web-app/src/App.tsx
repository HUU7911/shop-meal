import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth, RequireStaff } from './auth/Guards';
import AdminLayout from './components/AdminLayout';
import AccountLayout from './components/AccountLayout';
import CartLayout from './components/CartLayout';
import AppLayout from './components/AppLayout';
import AdminBanners from './pages/admin/AdminBanners';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPosts from './pages/admin/AdminPosts';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import AuthLayout from './pages/auth/AuthLayout';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import MenuPage from './pages/MenuPage';
import MyPostsPage from './pages/MyPostsPage';
import NotFoundPage from './pages/NotFoundPage';
import OrderDetailPage from './pages/OrderDetailPage';
import OrdersPage from './pages/OrdersPage';
import PaymentResultPage from './pages/PaymentResultPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <Routes>
      {/* Trang xác thực: layout riêng, không dùng AppLayout */}
      <Route element={<AuthLayout />}>
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="authenticate" element={<GoogleCallbackPage />} />
      </Route>

      {/* Giỏ hàng: page riêng, layout riêng (không banner / bài viết / footer) */}
      <Route element={<CartLayout />}>
        <Route path="cart" element={<CartPage />} />
          <Route element={<RequireAuth />}>
              <Route path="checkout" element={<CheckoutPage />} />
          </Route>
      </Route>

      <Route element={<AppLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="payment/success" element={<PaymentResultPage success />} />
        <Route path="payment/cancel" element={<PaymentResultPage success={false} />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Khu vực tài khoản: layout riêng, không có banner / bài viết / footer của trang bán hàng */}
      <Route element={<RequireAuth />}>
        <Route element={<AccountLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="my-posts" element={<MyPostsPage />} />
        </Route>
      </Route>

      <Route element={<RequireStaff />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route element={<RequireAdmin />}>
            <Route path="posts" element={<AdminPosts />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/orders" replace />} />
        </Route>
      </Route>
      {/* Đường dẫn cũ: chuyển về khu quản trị (chỉ ADMIN truy cập được) */}
      <Route path="/posts/create" element={<Navigate to="/admin/posts" replace />} />
    </Routes>
  );
}
