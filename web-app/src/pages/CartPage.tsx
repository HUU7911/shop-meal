import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AuthImage from '../components/AuthImage';
import EmptyState from '../components/EmptyState';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function CartPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading, increase, decrease, remove } = useCart();
  const items = cart?.items ?? [];

  if (!isAuthenticated)
    return (
      <EmptyState
        title="Đăng nhập để xem giỏ hàng"
        actionLabel="Đăng nhập"
        actionTo="/login"
        icon={<ShoppingBagOutlinedIcon fontSize="large" />}
      />
    );
  if (loading && !cart) return <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>;
  if (items.length === 0)
    return (
      <EmptyState
        title="Giỏ hàng đang trống"
        description="Chọn vài món từ thực đơn để bắt đầu."
        actionLabel="Xem thực đơn"
        actionTo="/"
        icon={<ShoppingBagOutlinedIcon fontSize="large" />}
      />
    );

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Giỏ hàng <Typography component="span" color="text.secondary" sx={{ fontSize: '1.1rem' }}>({totalQty} món)</Typography>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 360px' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        {/* Danh sách món */}
        <Receipt>
          {items.map((item, idx) => (
            <Box key={item.id}>
              {idx > 0 && <Box sx={dashed} />}
              <Stack direction="row" spacing={2} alignItems="center">
                <AuthImage src={item.image} alt={item.productName} sx={{ width: 72, height: 72, borderRadius: 1, flexShrink: 0 }} />
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography fontWeight={600} noWrap>{item.productName}</Typography>
                  <Typography variant="body2" color="text.secondary">{formatPrice(item.price)}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                    <IconButton size="small" aria-label="Giảm" onClick={() => decrease(item.id)} disabled={item.quantity <= 1}>
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <Typography sx={{ minWidth: 24, textAlign: 'center' }}>{item.quantity}</Typography>
                    <IconButton size="small" aria-label="Tăng" onClick={() => increase(item.id)}>
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {formatPrice(item.price * item.quantity)}
                  </Typography>
                  <IconButton size="small" aria-label="Xoá món" onClick={() => remove(item.id)}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          ))}
        </Receipt>

        {/* Tóm tắt đơn hàng */}
        <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
          <Receipt>
            <Typography variant="h6" gutterBottom>Tóm tắt đơn hàng</Typography>
            <ReceiptRow label="Số món" value={totalQty} />
            <ReceiptRow label="Tạm tính" value={formatPrice(cart?.totalPrice)} />
            <Box sx={dashed} />
            <ReceiptRow label="Tổng cộng" value={formatPrice(cart?.totalPrice)} bold />
          </Receipt>
          <Stack spacing={1.5} sx={{ mt: 3 }}>
            <Button component={RouterLink} to="/checkout" variant="contained" size="large" fullWidth>
              Đặt hàng
            </Button>
            <Button component={RouterLink} to="/" fullWidth>Chọn thêm món</Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
