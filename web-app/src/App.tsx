import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAdmin, RequireAuth, RequireStaff } from './auth/Guards';

// Lazy load layouts
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AccountLayout = lazy(() => import('./components/AccountLayout'));
const CartLayout = lazy(() => import('./components/CartLayout'));
const AppLayout = lazy(() => import('./components/AppLayout'));
const AuthLayout = lazy(() => import('./pages/auth/AuthLayout'));

// Lazy load Admin pages
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPosts = lazy(() => import('./pages/admin/AdminPosts'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));

// Lazy load Auth pages
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const GoogleCallbackPage = lazy(() => import('./pages/auth/GoogleCallbackPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

// Lazy load customer pages
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const MyPostsPage = lazy(() => import('./pages/MyPostsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function RouteFallback() {
    return (
        <div
            role="status"
            aria-live="polite"
            style={{
                minHeight: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#176b50',
                fontSize: 15,
            }}
        >
            Đang tải trang...
        </div>
    );
}

export default function App() {
    return (
        <Suspense fallback={<RouteFallback />}>
            <Routes>
                {/* Authentication */}
                <Route element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="authenticate" element={<GoogleCallbackPage />} />
                </Route>

                {/* Cart */}
                <Route element={<CartLayout />}>
                    <Route path="cart" element={<CartPage />} />

                    <Route element={<RequireAuth />}>
                        <Route path="checkout" element={<CheckoutPage />} />
                    </Route>
                </Route>

                {/* Main application */}
                <Route element={<AppLayout />}>
                    <Route index element={<MenuPage />} />
                    <Route
                        path="payment/success"
                        element={<PaymentResultPage success />}
                    />
                    <Route
                        path="payment/cancel"
                        element={<PaymentResultPage success={false} />}
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Customer account */}
                <Route element={<RequireAuth />}>
                    <Route element={<AccountLayout />}>
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/:id" element={<OrderDetailPage />} />
                        <Route path="my-posts" element={<MyPostsPage />} />
                    </Route>
                </Route>

                {/* Staff administration */}
                <Route element={<RequireStaff />}>
                    <Route path="admin" element={<AdminLayout />}>
                        <Route
                            index
                            element={<Navigate to="orders" replace />}
                        />

                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="banners" element={<AdminBanners />} />

                        <Route element={<RequireAdmin />}>
                            <Route path="posts" element={<AdminPosts />} />
                            <Route path="users" element={<AdminUsers />} />
                        </Route>

                        <Route
                            path="*"
                            element={<Navigate to="/admin/orders" replace />}
                        />
                    </Route>
                </Route>

                {/* Legacy route */}
                <Route
                    path="/posts/create"
                    element={<Navigate to="/admin/posts" replace />}
                />
            </Routes>
        </Suspense>
    );
}
