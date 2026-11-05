import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/client';
import { orderApi } from '../api/services';
import type { PaymentMethod, Product, SizeOption } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useNotify } from '../context/NotifyContext';
import { formatPrice, PAYMENT_METHOD_LABEL } from '../utils/format';
import Receipt, { dashed, ReceiptRow } from './Receipt';

const PHONE_RE = /^(0|\+84)\d{9}$/;

interface Props {
  open: boolean;
  onClose: () => void;
  product: Product;
  option: SizeOption;
  quantity: number;
}

export default function BuyNowDialog({ open, onClose, product, option, quantity }: Props) {
  const { profile } = useAuth();
  const notify = useNotify();
  const navigate = useNavigate();

  const [form, setForm] = useState({ receiverName: '', phone: '', address: '', note: '' });
  const [method, setMethod] = useState<PaymentMethod>('COD');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Điền sẵn từ hồ sơ, không ghi đè những gì người dùng đã nhập
  useEffect(() => {
    if (!profile) return;
    setForm((f) => ({
      ...f,
      receiverName: f.receiverName || [profile.lastName, profile.firstName].filter(Boolean).join(' '),
      phone: f.phone || profile.phoneNumber || '',
      address: f.address || profile.address || '',
    }));
  }, [profile]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;

    if (!form.receiverName.trim()) return setError('Vui lòng nhập tên người nhận.');
    if (!PHONE_RE.test(form.phone.trim())) {
      return setError('Số điện thoại không hợp lệ (ví dụ 0901234567 hoặc +84901234567).');
    }
    if (!form.address.trim()) return setError('Vui lòng nhập địa chỉ giao hàng.');

    setBusy(true);
    setError('');
    try {
      const order = await orderApi.buyNow({
        order: {
          receiverName: form.receiverName.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          note: form.note.trim() || undefined,
          paymentMethod: method,
        },
        food: {
          productId: product.id,
          size: option.size,
          price: option.price,
          quantity,
        },
      });

      if (method === 'PAYOS' && order.checkoutUrl) {
        window.location.href = order.checkoutUrl;
        return;
      }
      notify('Đặt hàng thành công!');
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const itemLabel = `${quantity} × ${product.name}${option.size ? ` (${option.size})` : ''}`;

  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mua ngay</DialogTitle>
      <DialogContent dividers>
        <Stack component="form" id="buy-now-form" spacing={2} onSubmit={submit} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Tên người nhận"
            value={form.receiverName}
            onChange={set('receiverName')}
            required
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label="Số điện thoại"
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            required
            placeholder="0901234567"
            slotProps={{ htmlInput: { maxLength: 13, inputMode: 'tel' } }}
          />
          <TextField
            label="Địa chỉ giao hàng"
            value={form.address}
            onChange={set('address')}
            required
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <TextField
            label="Ghi chú cho quán (không bắt buộc)"
            value={form.note}
            onChange={set('note')}
            slotProps={{ htmlInput: { maxLength: 255 } }}
          />

          <FormControl>
            <FormLabel>Phương thức thanh toán</FormLabel>
            <RadioGroup value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {(Object.keys(PAYMENT_METHOD_LABEL) as PaymentMethod[]).map((m) => (
                <FormControlLabel key={m} value={m} control={<Radio />} label={PAYMENT_METHOD_LABEL[m]} />
              ))}
            </RadioGroup>
          </FormControl>

          <Receipt sx={{ mb: 2 }}>
            <ReceiptRow label={itemLabel} value={formatPrice(option.price * quantity)} />
            <Box sx={dashed} />
            <ReceiptRow label="Tổng cộng" value={formatPrice(option.price * quantity)} bold />
          </Receipt>
          <Typography variant="caption" color="text.secondary" sx={{ mt: '-4px !important' }}>
            Tổng tiền cuối cùng do hệ thống tính theo giá hiện tại của món.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={busy}>
          Huỷ
        </Button>
        <Button type="submit" form="buy-now-form" variant="contained" disabled={busy}>
          {busy ? 'Đang đặt hàng…' : method === 'PAYOS' ? 'Đặt hàng và thanh toán' : 'Đặt hàng'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
