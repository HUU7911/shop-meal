import {
    alpha,
    Alert,
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
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

// Giữ khớp với MAX_QUANTITY ở cart-service / order-service
const MAX_QUANTITY = 99;

/** "Phở bò (M)" hoặc "Phở bò" nếu món không có size. */
const withSize = (name: string, size?: string) =>
    size ? `${name} (${size})` : name;

/** Mô tả ngắn dưới mỗi phương thức thanh toán. */
const PAYMENT_METHOD_HINT: Partial<Record<PaymentMethod, string>> = {
    COD: 'Trả tiền mặt cho người giao hàng khi nhận món.',
    PAYOS: 'Quét mã QR hoặc chuyển khoản qua PayOS sau khi đặt hàng.',
};

interface CheckoutLocationState {
    buyNow?: boolean;
    product?: Product;
    option?: SizeOption;
    quantity?: number;
}

type FieldKey = 'receiverName' | 'phone' | 'address';
type FieldErrors = Partial<Record<FieldKey, string>>;

/** Khối nhóm các trường liên quan, có tiêu đề rõ ràng. */
function Section({
                     title,
                     description,
                     children,
                 }: {
    title: string;
    description?: string;
    children: ReactNode;
}) {
    return (
        <Paper
            component="section"
            variant="outlined"
            sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}
        >
            <Typography variant="h6" component="h2">
                {title}
            </Typography>

            {description && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    {description}
                </Typography>
            )}

            <Stack spacing={2} sx={{ mt: 2.5 }}>
                {children}
            </Stack>
        </Paper>
    );
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
        quantity >= 1 &&
        quantity <= MAX_QUANTITY;

    const [form, setForm] = useState({
        receiverName: '',
        phone: '',
        address: '',
        note: '',
    });

    const [method, setMethod] = useState<PaymentMethod>('COD');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [busy, setBusy] = useState(false);

    const inputRefs = {
        receiverName: useRef<HTMLInputElement>(null),
        phone: useRef<HTMLInputElement>(null),
        address: useRef<HTMLTextAreaElement>(null),
    };

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

    const itemCount = validBuyNow
        ? quantity
        : items.reduce((sum, item) => sum + item.quantity, 0);

    // Chỉ để hiển thị. Tổng tiền thật do server tính lại khi tạo đơn.
    const totalPrice = validBuyNow
        ? option.price * quantity
        : cart?.totalPrice ?? 0;

    const set =
        (key: keyof typeof form) =>
            (e: ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;

                setForm((f) => ({ ...f, [key]: value }));

                // Xóa lỗi của trường ngay khi người dùng bắt đầu sửa
                if (key !== 'note' && fieldErrors[key]) {
                    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
                }
            };

    const validate = (): FieldErrors => {
        const errors: FieldErrors = {};

        if (!form.receiverName.trim()) {
            errors.receiverName = 'Vui lòng nhập tên người nhận.';
        }

        if (!PHONE_RE.test(form.phone.trim())) {
            errors.phone = 'Số điện thoại không hợp lệ.';
        }

        if (!form.address.trim()) {
            errors.address = 'Vui lòng nhập địa chỉ giao hàng.';
        }

        return errors;
    };

    const submit = async (e: FormEvent) => {
        e.preventDefault();

        const errors = validate();
        setFieldErrors(errors);

        const firstInvalid = (
            ['receiverName', 'phone', 'address'] as FieldKey[]
        ).find((key) => errors[key]);

        if (firstInvalid) {
            setError('');
            inputRefs[firstInvalid].current?.focus();
            return;
        }

        if (isBuyNow && !validBuyNow) {
            setError(
                'Thông tin sản phẩm không hợp lệ. Vui lòng chọn sản phẩm lại.',
            );
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

            const order = validBuyNow
                ? await orderApi.buyNow({
                    order: orderInfo,
                    food: {
                        productId: product.id,
                        size: option.size,
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

    const submitLabel = busy
        ? 'Đang đặt hàng…'
        : method === 'PAYOS'
            ? 'Đặt hàng và thanh toán'
            : 'Đặt hàng';

    return (
        <Box sx={{ pb: { xs: 12, md: 0 } }}>
            <Box sx={{ mb: { xs: 2.5, md: 4 } }}>
                <Typography variant="h4" component="h1">
                    Thanh toán
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    Kiểm tra thông tin giao hàng rồi đặt món.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'minmax(0, 1fr) 380px',
                    },
                    gap: { xs: 3, md: 4 },
                    alignItems: 'start',
                }}
            >
                <Stack
                    component="form"
                    id="checkout-form"
                    spacing={3}
                    onSubmit={submit}
                    noValidate
                >
                    {error && (
                        <Alert severity="error" role="alert">
                            {error}
                        </Alert>
                    )}

                    <Section
                        title="Thông tin nhận hàng"
                        description="Shipper sẽ gọi theo số điện thoại này khi đến."
                    >
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: '1fr 1fr',
                                },
                                gap: 2,
                            }}
                        >
                            <TextField
                                label="Tên người nhận"
                                value={form.receiverName}
                                onChange={set('receiverName')}
                                required
                                autoComplete="name"
                                inputRef={inputRefs.receiverName}
                                error={!!fieldErrors.receiverName}
                                helperText={fieldErrors.receiverName}
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
                                autoComplete="tel"
                                inputRef={inputRefs.phone}
                                error={!!fieldErrors.phone}
                                helperText={
                                    fieldErrors.phone ??
                                    'Ví dụ 0901234567 hoặc +84901234567'
                                }
                                slotProps={{
                                    htmlInput: {
                                        maxLength: 13,
                                        inputMode: 'tel',
                                    },
                                }}
                            />
                        </Box>

                        <TextField
                            label="Địa chỉ giao hàng"
                            value={form.address}
                            onChange={set('address')}
                            required
                            multiline
                            minRows={2}
                            autoComplete="street-address"
                            inputRef={inputRefs.address}
                            error={!!fieldErrors.address}
                            helperText={
                                fieldErrors.address ??
                                'Số nhà, tên đường, phường/xã, quận/huyện'
                            }
                            slotProps={{
                                htmlInput: { maxLength: 500 },
                            }}
                        />

                        <TextField
                            label="Ghi chú cho quán (không bắt buộc)"
                            value={form.note}
                            onChange={set('note')}
                            placeholder="Ít cay, không hành, gọi trước khi giao…"
                            slotProps={{
                                htmlInput: { maxLength: 255 },
                            }}
                        />
                    </Section>

                    <Section title="Phương thức thanh toán">
                        <FormControl>
                            <RadioGroup
                                aria-label="Phương thức thanh toán"
                                value={method}
                                onChange={(e) =>
                                    setMethod(e.target.value as PaymentMethod)
                                }
                                sx={{ gap: 1.5 }}
                            >
                                {(Object.keys(
                                    PAYMENT_METHOD_LABEL,
                                ) as PaymentMethod[]).map((m) => {
                                    const selected = method === m;
                                    const hint = PAYMENT_METHOD_HINT[m];

                                    return (
                                        <FormControlLabel
                                            key={m}
                                            value={m}
                                            control={
                                                <Radio sx={{ mt: -0.5 }} />
                                            }
                                            label={
                                                <Box>
                                                    <Typography fontWeight={600}>
                                                        {PAYMENT_METHOD_LABEL[m]}
                                                    </Typography>

                                                    {hint && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                        >
                                                            {hint}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            sx={(theme) => ({
                                                m: 0,
                                                p: 1.5,
                                                alignItems: 'flex-start',
                                                border: 1,
                                                borderRadius: 2,
                                                borderColor: selected
                                                    ? 'primary.main'
                                                    : 'divider',
                                                bgcolor: selected
                                                    ? alpha(
                                                        theme.palette.primary
                                                            .main,
                                                        0.06,
                                                    )
                                                    : 'transparent',
                                                transition:
                                                    'border-color .15s, background-color .15s',
                                                '&:hover': {
                                                    borderColor: selected
                                                        ? 'primary.main'
                                                        : 'text.disabled',
                                                },
                                            })}
                                        />
                                    );
                                })}
                            </RadioGroup>

                            {method === 'PAYOS' && (
                                <FormHelperText sx={{ mx: 0, mt: 1.5 }}>
                                    Bạn sẽ được chuyển sang trang PayOS để hoàn
                                    tất thanh toán.
                                </FormHelperText>
                            )}
                        </FormControl>
                    </Section>
                </Stack>

                <Box
                    component="aside"
                    sx={{
                        position: { md: 'sticky' },
                        top: { md: 24 },
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            mb: 1.5,
                        }}
                    >
                        <Typography variant="h6" component="h2">
                            Đơn hàng của bạn
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {itemCount} món
                        </Typography>
                    </Box>

                    <Receipt>
                        {validBuyNow ? (
                            <ReceiptRow
                                label={`${quantity} × ${withSize(product.name, option.size)}`}
                                value={formatPrice(option.price * quantity)}
                            />
                        ) : (
                            items.map((item) => (
                                <ReceiptRow
                                    key={item.id}
                                    label={`${item.quantity} × ${withSize(item.productName, item.size)}`}
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

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 1.5 }}
                    >
                        Tổng tiền cuối cùng do hệ thống xác nhận khi đặt hàng.
                    </Typography>

                    <Stack spacing={1} sx={{ mt: 3 }}>
                        {/* Trên mobile, nút đặt hàng nằm ở thanh cố định phía dưới */}
                        <Button
                            type="submit"
                            form="checkout-form"
                            variant="contained"
                            size="large"
                            disabled={busy}
                            sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                        >
                            {submitLabel}
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

            {/* Thanh đặt hàng cố định cho mobile */}
            <Paper
                square
                elevation={8}
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    position: 'fixed',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: (theme) => theme.zIndex.appBar,
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 1.5,
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" color="text.secondary">
                        Tổng cộng
                    </Typography>

                    <Typography variant="h6" noWrap>
                        {formatPrice(totalPrice)}
                    </Typography>
                </Box>

                <Button
                    type="submit"
                    form="checkout-form"
                    variant="contained"
                    size="large"
                    disabled={busy}
                >
                    {submitLabel}
                </Button>
            </Paper>
        </Box>
    );
}