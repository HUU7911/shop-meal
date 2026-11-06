
import {
    Alert,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from 'react-router-dom';

import { getErrorMessage } from '../api/client';
import { orderApi } from '../api/services';
import type { PaymentMethod, Product, SizeOption } from '../api/types';

import EmptyState from '../components/EmptyState';
import Receipt, { dashed, ReceiptRow } from '../components/Receipt';

import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotify } from '../context/NotifyContext';

import { formatPrice, PAYMENT_METHOD_LABEL } from '../utils/format';

const PHONE_RE = /^(0|\+84)\d{9}$/;

interface CheckoutLocationState {
    buyNow?: boolean;
    product?: Product;
    option?: SizeOption;
    quantity?: number;
}

export default function CheckoutPage() {
    const { profile } = useAuth();
    const { cart, clearAfterOrder } = useCart();
    const notify = useNotify();
    const navigate = useNavigate();
    const location = useLocation();

    const checkoutState = location.state as CheckoutLocationState | null;

    // Phân biệt mua ngay và thanh toán giỏ hàng
    const isBuyNow = checkoutState?.buyNow === true;

    const product = checkoutState?.product;
    const option = checkoutState?.option;
    const quantity = checkoutState?.quantity ?? 1;

    const validBuyNow =
        isBuyNow &&
        !!product &&
        !!option &&
        Number.isInteger(quantity) &&
        quantity >= 1;

    const [form, setForm] = useState({
        receiverName: '',
        phone: '',
        address: '',
        note: '',
    });

    const [method, setMethod] = useState<PaymentMethod>('COD');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!profile) return;

        setForm((f) => ({
            ...f,
            receiverName:
                f.receiverName ||
                [profile.lastName, profile.firstName]
                    .filter(Boolean)
                    .join(' '),
            phone: f.phone || profile.phoneNumber || '',
            address: f.address || profile.address || '',
        }));
    }, [profile]);

    const items = cart?.items ?? [];

    // Tổng tiền thay đổi theo luồng thanh toán
    const totalPrice = validBuyNow
        ? option.price * quantity
        : cart?.totalPrice ?? 0;

    const set =
        (key: keyof typeof form) =>
        (e: ChangeEvent<HTMLInputElement>) => {
            setForm((f) => ({
                ...f,
                [key]: e.target.value,
            }));
        };

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        if (!form.receiverName.trim()) {
            setError('Vui lòng nhập tên người nhận.');
            return;
        }

        if (!PHONE_RE.test(form.phone.trim())) {
            setError(
                'Số điện thoại không hợp lệ (ví dụ 0901234567 hoặc +84901234567).',
            );
            return;
        }

        if (!form.address.trim()) {
            setError('Vui lòng nhập địa chỉ giao hàng.');
            return;
        }

        if (isBuyNow && !validBuyNow) {
            setError('Thông tin sản phẩm không hợp lệ. Vui lòng chọn sản phẩm lại.');
            return;
        }

        if (!isBuyNow && items.length === 0) {
            setError('Giỏ hàng đang trống.');
            return;
        }

        setBusy(true);
        setError('');

        try {
            const orderInfo = {
                receiverName: form.receiverName.trim(),
                phone: form.phone.trim(),
                address: form.address.trim(),
                note: form.note.trim() || undefined,
                paymentMethod: method,
            };

            // Mua ngay: tạo đơn với đúng sản phẩm đang chọn
            // Thanh toán giỏ hàng: tạo đơn từ giỏ hàng hiện tại
            const order = validBuyNow
                ? await orderApi.buyNow({
                      order: orderInfo,
                      food: {
                          productId: product.id,
                          size: option.size,
                          price: option.price,
                          quantity,
                      },
                  })
                : await orderApi.create(orderInfo);

            // Chỉ xóa giỏ hàng khi đặt hàng từ giỏ hàng
            if (!isBuyNow) {
                await clearAfterOrder();
            }

            // Thanh toán PayOS
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

    // Không có sản phẩm hợp lệ khi chọn mua ngay
    if (isBuyNow && !validBuyNow && !busy) {
        return (
            <EmptyState
                title="Không tìm thấy thông tin sản phẩm"
                actionLabel="Xem thực đơn"
                actionTo="/"
            />
        );
    }

    // Giỏ hàng trống và không phải luồng mua ngay
    if (!isBuyNow && items.length === 0 && !busy) {
        return (
            <EmptyState
                title="Giỏ hàng đang trống"
                actionLabel="Xem thực đơn"
                actionTo="/"
            />
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Thanh toán
            </Typography>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 380px',
                    },
                    gap: 4,
                    alignItems: 'start',
                }}
            >
                <Stack
                    component="form"
                    id="checkout-form"
                    spacing={2}
                    onSubmit={submit}
                >
                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Tên người nhận"
                        value={form.receiverName}
                        onChange={set('receiverName')}
                        required
                        slotProps={{
                            htmlInput: { maxLength: 100 },
                        }}
                    />

                    <TextField
                        label="Số điện thoại"
                        type="tel"
                        value={form.phone}
                        onChange={set('phone')}
                        required
                        placeholder="0901234567"
                        slotProps={{
                            htmlInput: {
                                maxLength: 13,
                                inputMode: 'tel',
                            },
                        }}
                    />

                    <TextField
                        label="Địa chỉ giao hàng"
                        value={form.address}
                        onChange={set('address')}
                        required
                        multiline
                        minRows={2}
                        slotProps={{
                            htmlInput: { maxLength: 500 },
                        }}
                    />

                    <TextField
                        label="Ghi chú cho quán (không bắt buộc)"
                        value={form.note}
                        onChange={set('note')}
                        slotProps={{
                            htmlInput: { maxLength: 255 },
                        }}
                    />

                    <FormControl>
                        <FormLabel>Phương thức thanh toán</FormLabel>

                        <RadioGroup
                            value={method}
                            onChange={(e) =>
                                setMethod(e.target.value as PaymentMethod)
                            }
                        >
                            {(Object.keys(
                                PAYMENT_METHOD_LABEL,
                            ) as PaymentMethod[]).map((m) => (
                                <FormControlLabel
                                    key={m}
                                    value={m}
                                    control={<Radio />}
                                    label={PAYMENT_METHOD_LABEL[m]}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                </Stack>

                <Box>
                    <Receipt>
                        {validBuyNow ? (
                            <ReceiptRow
                                label={`${quantity} × ${product.name} (${option.size})`}
                                value={formatPrice(option.price * quantity)}
                            />
                        ) : (
                            items.map((item) => (
                                <ReceiptRow
                                    key={item.id}
                                    label={`${item.quantity} × ${item.productName}`}
                                    value={formatPrice(
                                        item.price * item.quantity,
                                    )}
                                />
                            ))
                        )}

                        <Box sx={dashed} />

                        <ReceiptRow
                            label="Tổng cộng"
                            value={formatPrice(totalPrice)}
                            bold
                        />
                    </Receipt>

                    <Stack spacing={1} sx={{ mt: 3 }}>
                        <Button
                            type="submit"
                            form="checkout-form"
                            variant="contained"
                            size="large"
                            disabled={busy}
                        >
                            {busy
                                ? 'Đang đặt hàng…'
                                : method === 'PAYOS'
                                  ? 'Đặt hàng và thanh toán'
                                  : 'Đặt hàng'}
                        </Button>

                        <Button
                            component={RouterLink}
                            to={
                                validBuyNow
                                    ? `/product/${product.id}`
                                    : '/cart'
                            }
                        >
                            {validBuyNow
                                ? 'Quay lại sản phẩm'
                                : 'Quay lại giỏ hàng'}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
