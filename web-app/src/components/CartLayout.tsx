import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AppBar, Avatar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, Outlet, useLocation} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import AuthImage from './AuthImage';

export default function CartLayout() {
  const { isAuthenticated, profile } = useAuth();
  const displayName = profile?.firstName || profile?.username || 'Tài khoản';
  const { pathname } = useLocation();
  const isCheckout = pathname.startsWith('/checkout');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Toolbar disableGutters sx={{ gap: 1.5, minHeight: { xs: 56, md: 64 } }}>
            <IconButton
                component={RouterLink}
                to={isCheckout ? '/cart' : '/'}
                aria-label={isCheckout ? 'Quay lại giỏ hàng' : 'Quay lại cửa hàng'}
                edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Box component={RouterLink} to="/" aria-label="Shop Meal - Trang chủ" sx={{ display: 'flex', flexShrink: 0 }}>
              <Box
                component="img"
                src="/shop-meal-logo.png"
                alt="Shop Meal"
                sx={{ display: 'block', width: { xs: 100, md: 140 }, height: 44, objectFit: 'contain', objectPosition: 'left center' }}
              />
            </Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary', ml: 1, pl: 2, borderLeft: 1, borderColor: 'divider' }}
            >
              Giỏ hàng
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {isAuthenticated ? (
              <IconButton component={RouterLink} to="/profile" aria-label="Tài khoản" sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', overflow: 'hidden' }}>
                  {profile?.avatar ? (
                    <AuthImage src={profile.avatar} alt={displayName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </Avatar>
              </IconButton>
            ) : (
              <Button component={RouterLink} to="/login" variant="contained" sx={{ borderRadius: 6, px: 2.5 }}>
                Đăng nhập
              </Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container component="main" maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Outlet />
      </Container>
    </Box>
  );
}
