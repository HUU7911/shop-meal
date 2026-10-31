import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from '@mui/material';
import { ReactElement } from 'react';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import AuthImage from './AuthImage';

interface NavItem {
  to: string;
  label: string;
  icon: ReactElement;
}

export default function AccountLayout() {
  const { profile, info, isStaff, logout } = useAuth();
  const { count } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const displayName = profile?.firstName || profile?.username || 'Tài khoản';
  const items: NavItem[] = [
    { to: '/profile', label: 'Hồ sơ của tôi', icon: <PersonIcon /> },
    { to: '/orders', label: 'Đơn hàng của tôi', icon: <ReceiptLongIcon /> },
    // Chỉ STAFF/ADMIN mới đăng được bài nên mới có mục quản lý bài viết cá nhân
    ...(isStaff ? [{ to: '/my-posts', label: 'Bài viết của tôi', icon: <ArticleOutlinedIcon /> }] : []),
  ];
  const current = items.find((i) => pathname.startsWith(i.to))?.to ?? false;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 3 } }}>
          <Toolbar disableGutters sx={{ gap: 1.5, minHeight: { xs: 56, md: 64 } }}>
            <Box component={RouterLink} to="/" aria-label="Shop Meal - Trang chủ" sx={{ display: 'flex', flexShrink: 0 }}>
              <Box
                component="img"
                src="/shop-meal-logo.webp"
                alt="Shop Meal"
                sx={{ display: 'block', width: { xs: 112, md: 140 }, height: 44, objectFit: 'contain', objectPosition: 'left center' }}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button component={RouterLink} to="/" startIcon={<StorefrontIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
              Về cửa hàng
            </Button>
            <IconButton component={RouterLink} to="/cart" aria-label="Giỏ hàng">
              <Badge badgeContent={count} color="secondary">
                <ShoppingBagOutlinedIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {/* Mobile: tab ngang */}
          <Tabs
            value={current}
            variant="scrollable"
            sx={{ display: { xs: 'flex', md: 'none' }, borderBottom: 1, borderColor: 'divider' }}
          >
            {items.map((i) => (
              <Tab key={i.to} value={i.to} label={i.label} icon={i.icon} iconPosition="start" component={RouterLink} to={i.to} />
            ))}
          </Tabs>

          {/* Desktop: thanh bên */}
          <Paper variant="outlined" sx={{ display: { xs: 'none', md: 'block' }, p: 1.5, position: 'sticky', top: 84 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1, py: 1.5 }}>
              <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', overflow: 'hidden' }}>
                {profile?.avatar ? (
                  <AuthImage src={profile.avatar} alt={displayName} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>{displayName}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {info?.roles.join(', ')}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <List disablePadding>
              {items.map((i) => (
                <ListItemButton key={i.to} component={RouterLink} to={i.to} selected={current === i.to} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>{i.icon}</ListItemIcon>
                  <ListItemText primary={i.label} />
                </ListItemButton>
              ))}
            </List>
            <Divider sx={{ my: 1 }} />
            <ListItemButton
              sx={{ borderRadius: 2 }}
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Đăng xuất" />
            </ListItemButton>
          </Paper>

          <Box component="main" sx={{ minWidth: 0 }}>
            <Outlet />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
