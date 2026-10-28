import { api, unwrap } from './client';
import type {
  AddToCartRequest,
  AuthenticationResponse,
  Banner,
  Cart,
  Category,
  CreateOrderRequest,
  Order,
  OrderStatus,
  PageResponse,
  PostArticle,
  PostForProduct,
  Product,
  ProductType,
  Profile,
  ProfileUpdateRequest,
  User,
  UserCreationRequest,
} from './types';

// ---------------- identity-service ----------------
export const authApi = {
  login: (username: string, password: string) =>
    unwrap<AuthenticationResponse>(api.post('/identity/auth/login', { username, password })),
  logout: (token: string) => api.post('/identity/auth/logout', { token }),
  googleExchange: (code: string) =>
    unwrap<AuthenticationResponse>(api.post('/identity/auth/outbound/identity', null, { params: { code } })),
  forgotPassword: (email: string) => api.post('/identity/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) =>
    unwrap<{ resetToken: string }>(api.post('/identity/auth/verify-otp', { email, otp })),
  resetPassword: (resetToken: string, newPassword: string) =>
    api.post('/identity/auth/reset-password', { resetToken, newPassword }),
  register: (body: UserCreationRequest) => unwrap<User>(api.post('/identity/users/create', body)),
};

export const userApi = {
  list: () => unwrap<User[]>(api.get('/identity/users')),
  createStaff: (body: UserCreationRequest) => unwrap<User>(api.post('/identity/internal/users/create', body)),
};

// ---------------- profile-service ----------------
export const profileApi = {
  me: () => unwrap<Profile>(api.get('/profile/my-profile')),
  update: (body: ProfileUpdateRequest) => unwrap<Profile>(api.put('/profile/update', body)),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<Profile>(api.post('/profile/update/avatar', form));
  },
};

// ---------------- product-service ----------------
/** Khớp FoodRequest / FoodUpdateRequest: `size[i]` đi cùng `price[i]`. */
export interface FoodPayload {
  name: string;
  size: string[];
  price: number[];
  type: ProductType;
  position?: string;
  timeWork?: string;
  categories: string[];
}

export const productApi = {
  list: (page: number, size: number) =>
    unwrap<PageResponse<Product>>(api.get('/product/food', { params: { page, size } })),
  categories: () => unwrap<Category[]>(api.get('/product/category')),
  createCategory: (body: Category) => unwrap<Category>(api.post('/product/category/create', body)),
  deleteCategory: (name: string) => api.delete(`/product/category/delete/${encodeURIComponent(name)}`),
  /**
   * Gửi multipart gồm 2 phần: `food` (JSON) và `file` (ảnh).
   * Backend cần nhận bằng @RequestPart("food") FoodRequest + @RequestPart("file") MultipartFile.
   */
  createFood: (
    food: FoodPayload,
    file: File,
  ) => {
    const form = new FormData();
    form.append('food', new Blob([JSON.stringify(food)], { type: 'application/json' }));
    form.append('file', file);
    return unwrap<Product>(api.post('/product/food/create', form));
  },
  deleteFood: (id: string) => api.delete(`/product/food/delete/${id}`),
  /**
   * PUT /food/update/{id} (multipart: `food` JSON + `file`).
   * product-service luôn upload lại ảnh khi cập nhật (file không thể bỏ trống dù khai báo required=false),
   * và FoodUpdateRequest ghi đè mọi trường -> phải gửi đủ tên, giá, loại, vị trí, giờ bán, danh mục.
   */
  updateFood: (
    id: string,
    food: FoodPayload,
    file: File,
  ) => {
    const form = new FormData();
    form.append('food', new Blob([JSON.stringify(food)], { type: 'application/json' }));
    form.append('file', file);
    return unwrap<Product>(api.put(`/product/food/update/${id}`, form));
  },
};

// ---------------- post-service (banner) ----------------
// Gateway chỉ cho khách xem /post/** khi có token, nên banner chỉ tải được sau khi đăng nhập.
export interface CreatePostRequest {
  postTitle: string;
  postContent: string;
}

/** Khớp PostUpdateRequest của backend (cùng các field với PostRequest). */
export interface UpdatePostRequest extends CreatePostRequest {
  imageUrl?: string;
}

export const postApi = {
  /** GET /post/my-posts — bài viết của chính người dùng đăng nhập. */
  myPosts: (page = 1, size = 5) =>
    unwrap<PageResponse<PostArticle>>(api.get('/post/my-posts', { params: { page, size } })),

  /** PUT /post/update/my-post/{id} — sửa bài viết của chính mình (JSON). */
  update: (id: string, request: UpdatePostRequest) =>
    unwrap<PostArticle>(api.put(`/post/update/my-post/${id}`, request)),

  list: (page = 1, size = 9) =>
    unwrap<PageResponse<PostArticle>>(
      api.get('/post/getAllPost', { params: { page, size } })
    ),

  /**
   * POST /post/create (multipart): phần `request` (JSON) + phần `file` (ảnh, bắt buộc).
   * post-service upload ảnh qua file-service rồi lưu imageUrl vào bài viết.
   */
  create: (request: CreatePostRequest, file: File) => {
    const form = new FormData();
    form.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    form.append('file', file);
    return unwrap<PostArticle>(api.post('/post/create', form));
  },

  /** POST /post/product/create?Id={productId} — bài viết gắn với món ăn (JSON, không có ảnh). */
  createForProduct: (productId: string, request: CreatePostRequest) =>
    unwrap<PostForProduct>(api.post('/post/product/create', request, { params: { Id: productId } })),

  /** GET /post/getPostForProduct — backend trả về bài của mọi món, nên lọc theo productId ở client. */
  listForProduct: async (productId?: string) => {
    const all = await unwrap<PostForProduct[]>(api.get('/post/getPostForProduct'));
    const list = all ?? [];
    return productId ? list.filter((p) => p.productId === productId) : list;
  },
};

export const bannerApi = {
  list: () => unwrap<Banner[]>(api.get('/post/banner/getAll')),
  /** STAFF/ADMIN: gửi multipart với phần `file`. */
  create: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return unwrap<Banner>(api.post('/post/banner/create', form));
  },
  /** Chỉ ADMIN (BannerService.deleteBanner có @PreAuthorize). */
  remove: (id: string) => api.delete(`/post/banner/delete/${id}`),
};

// ---------------- search-service ----------------
export type SortOption = 'RELEVANCE' | 'PRICE_ASC' | 'PRICE_DESC';

export interface SearchParams {
  keyword?: string;
  category?: string;
  type?: ProductType;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page: number; // 0-based
  size: number;
}

export const searchApi = {
  products: (params: SearchParams) =>
    unwrap<PageResponse<Product>>(api.get('/search/product', { params })),
};

// ---------------- cart-service ----------------
export const cartApi = {
  get: () => unwrap<Cart>(api.get('/cart/my-cart')),
  add: (body: AddToCartRequest) => unwrap<Cart>(api.post('/cart/add', body)),
  increase: (itemId: string) => unwrap<Cart>(api.patch(`/cart/items/${itemId}/increase`)),
  decrease: (itemId: string) => unwrap<Cart>(api.patch(`/cart/items/${itemId}/decrease`)),
  remove: (itemId: string) => unwrap<Cart>(api.delete(`/cart/items/${itemId}`)),
};

// ---------------- order-service ----------------
export const orderApi = {
  create: (body: CreateOrderRequest) => unwrap<Order>(api.post('/order/create', body)),
  mine: (page: number, size: number) =>
    unwrap<PageResponse<Order>>(api.get('/order/my-orders', { params: { page, size } })),
  get: (id: string) => unwrap<Order>(api.get(`/order/${id}`)),
  cancel: (id: string) => unwrap<Order>(api.patch(`/order/${id}/cancel`)),
  adminList: (page: number, size: number, status?: OrderStatus) =>
    unwrap<PageResponse<Order>>(api.get('/order/admin', { params: { page, size, status } })),
  adminUpdateStatus: (id: string, status: OrderStatus) =>
    unwrap<Order>(api.patch(`/order/admin/${id}/status`, { status })),
  adminConfirmPayment: (id: string) => unwrap<Order>(api.patch(`/order/admin/${id}/confirm-payment`)),
};