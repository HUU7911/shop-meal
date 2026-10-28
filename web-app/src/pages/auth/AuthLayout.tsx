import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Box, Link, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Link as RouterLink, Outlet } from 'react-router-dom';

/**
 * Layout riêng cho các trang xác thực (đăng nhập, đăng ký, quên mật khẩu, callback Google).
 * Không có header / banner / bài viết / footer của cửa hàng.
 */
export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 2,
        py: { xs: 3, sm: 5 },
        background: (t) =>
          `linear-gradient(160deg, ${t.palette.background.default} 0%, #E3EEE4 55%, #FBF1D8 100%)`,
      }}
    >
      <Box component={RouterLink} to="/" aria-label="Shop Meal - Trang chủ" sx={{ mb: 3, display: 'block' }}>
        <Box
          component="img"
          src="/shop-meal-logo.png"
          alt="Shop Meal"
          sx={{ display: 'block', width: { xs: 130, sm: 160 }, height: 56, objectFit: 'contain' }}
        />
      </Box>

      <Box sx={{ width: '100%', maxWidth: 440, flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Link
        component={RouterLink}
        to="/"
        variant="body2"
        underline="hover"
        sx={{ mt: 3, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
      >
        <ArrowBackIcon sx={{ fontSize: 16 }} /> Về trang chủ
      </Link>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        © {new Date().getFullYear()} Shop Meal
      </Typography>
    </Box>
  );
}

/** Thẻ chứa tiêu đề + form, dùng chung cho các trang xác thực. */
export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      {subtitle && <Typography color="text.secondary" sx={{ mb: 2 }}>{subtitle}</Typography>}
      {children}
    </Paper>
  );
}
