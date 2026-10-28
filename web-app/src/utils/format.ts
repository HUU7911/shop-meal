import type { OrderStatus, PaymentMethod, Product, ProductType, SizeOption } from '../api/types';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
export const formatPrice = (value?: number | null) => vnd.format(Number(value ?? 0));

/**
 * Ghép `size[]` và `price[]` (hai mảng song song ở backend) thành danh sách lựa chọn.
 * Chịu được dữ liệu cũ: `price` là một số đơn lẻ hoặc thiếu `size` -> coi như một lựa chọn duy nhất.
 */
export const getSizeOptions = (product: Pick<Product, 'size' | 'price'>): SizeOption[] => {
  const rawPrice = product.price as unknown;
  const prices: number[] = Array.isArray(rawPrice)
    ? rawPrice.map(Number)
    : rawPrice == null
      ? []
      : [Number(rawPrice)];
  const sizes = Array.isArray(product.size) ? product.size : [];
  return prices.map((price, i) => ({
    size: sizes[i] ?? (prices.length > 1 ? `Size ${i + 1}` : ''),
    price: Number.isFinite(price) ? price : 0,
  }));
};

/** "25.000 ₫" nếu mọi size cùng giá, "25.000 ₫ – 35.000 ₫" nếu khác giá. */
export const formatPriceRange = (options: SizeOption[]) => {
  if (options.length === 0) return formatPrice(0);
  const prices = options.map((o) => o.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${formatPrice(min)} – ${formatPrice(max)}`;
};

export const formatDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang chuẩn bị',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

// Phải khớp OrderStatus.canTransitionTo ở order-service
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  COD: 'Thanh toán khi nhận hàng',
  PAYOS: 'Chuyển khoản QR (PayOS)',
};

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = { FOOD: 'Món ăn', DRINK: 'Đồ uống' };

// product-service tạo sẵn 4 danh mục này khi khởi động; danh mục do admin thêm hiển thị theo đúng tên.
export const CATEGORY_LABEL: Record<string, string> = {
  CAFE: 'Cà phê',
  NOODLE: 'Mì, bún, phở',
  RICE: 'Cơm',
  MILK_TEA: 'Trà sữa',
};
export const categoryLabel = (name: string) => CATEGORY_LABEL[name] ?? name;
