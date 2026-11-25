# MB-05 Le Phu Quy – Payment Service & Post Service

## 1. Giới thiệu

MB-05 phụ trách nghiệp vụ thanh toán và quản lý nội dung hiển thị trong hệ thống Shop Meal.

Nhóm bao gồm 2 Microservices:

| Microservice | Chức năng | Port |
|---|---|---:|
| Payment Service | Quản lý thanh toán | 8087 |
| Post Service | Quản lý bài viết và banner | 8089 |

## 2. Kiến trúc và luồng hoạt động

```text
                Frontend
                    |
                    v
               API Gateway
                    |
             +------+------+
             |             |
             v             v
       Payment Service  Post Service
           :8087          :8089
             |             |
             v             v
           MySQL         MongoDB
             |             |
             v             v
           PayOS       Product Service
             |
             v
        Payment Events
             |
             v
        Order Service
```

Payment Service xử lý giao dịch thanh toán, trong khi Post Service quản lý nội dung bài viết, banner và dữ liệu bài viết liên quan đến sản phẩm.

## 3. Chi tiết các Microservice

### 3.1. Payment Service

**Vai trò:**

Quản lý thông tin thanh toán và tích hợp cổng thanh toán PayOS trong hệ thống Shop Meal.

**Chức năng:**

- Tạo yêu cầu thanh toán.
- Tích hợp PayOS.
- Tiếp nhận webhook từ PayOS.
- Xử lý kết quả thanh toán.
- Quản lý trạng thái thanh toán.
- Phát sinh và tiếp nhận sự kiện thanh toán.
- Theo dõi thời hạn thanh toán.
- Hỗ trợ tự động xử lý các giao dịch hết hạn thông qua scheduler.

**Các thành phần chính:**

- Payment
- PaymentRepository
- PaymentService
- PaymentController
- PaymentExpirationScheduler
- PayOSConfig
- PaymentStatus
- PaymentEventListener

**Công nghệ:**

- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- PayOS API
- Apache Kafka
- Spring Cloud Netflix Eureka Client

**Database:** `payment_db`

**Port:** `8087`

**Context Path:** `/payment`

### 3.2. Post Service

**Vai trò:**

Quản lý nội dung bài viết và banner phục vụ giao diện Shop Meal.

**Chức năng:**

- Tạo bài viết.
- Lấy danh sách bài viết.
- Lấy bài viết của người dùng hiện tại.
- Cập nhật bài viết.
- Xóa bài viết.
- Tạo bài viết liên quan đến sản phẩm.
- Lấy danh sách bài viết liên quan đến sản phẩm.
- Xóa bài viết liên quan đến sản phẩm.
- Quản lý banner.
- Lấy danh sách banner.
- Xóa banner.
- Tương tác với Product Service, Profile Service và File Service thông qua OpenFeign.

**Các thành phần chính:**

- Post
- Banner
- PostForProduct
- PostController
- BannerController
- PostService
- BannerService
- PostRepository
- BannerRepository
- PostForProductRepository
- ProductClient
- ProfileClient
- FileClient

**Công nghệ:**

- Spring Boot
- Spring Data MongoDB
- Spring Security
- JWT
- Redis
- OpenFeign
- MapStruct
- Spring Cloud Netflix Eureka Client

**Database:** MongoDB (`post_db`)

**Port:** `8089`

**Context Path:** `/post`

## 4. Quy trình thanh toán

Luồng nghiệp vụ tổng quan:

```text
Customer
   |
   v
Order Service
   |
   v
Payment Service
   |
   | Create Payment
   v
PayOS
   |
   | Payment Result / Webhook
   v
Payment Service
   |
   | Update Payment Status
   v
Payment Database
   |
   | Payment Event
   v
Order Service
```

Payment Service tiếp nhận yêu cầu tạo thanh toán từ nghiệp vụ đơn hàng, giao tiếp với PayOS và xử lý kết quả thanh toán thông qua webhook.

Ngoài ra, Payment Service sử dụng PaymentExpirationScheduler để xử lý các giao dịch hết hạn theo cấu hình thời gian.

## 5. API chính

### Payment Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/payment/paid/create` | Tạo thanh toán |
| POST | `/payment/paid/payos-webhook` | Tiếp nhận webhook PayOS |

### Post Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/post/create` | Tạo bài viết |
| GET | `/post/my-posts` | Lấy bài viết cá nhân |
| GET | `/post/getAllPost` | Lấy danh sách bài viết |
| POST | `/post/product/create` | Tạo bài viết sản phẩm |
| GET | `/post/getPostForProduct` | Lấy bài viết sản phẩm |
| DELETE | `/post/delete/myPost` | Xóa bài viết cá nhân |
| DELETE | `/post/delete/product/{productId}` | Xóa bài viết sản phẩm |
| PUT | `/post/update/my-post/{id}` | Cập nhật bài viết |
| POST | `/post/banner/create` | Tạo banner |
| GET | `/post/banner/getAll` | Lấy danh sách banner |
| DELETE | `/post/banner/delete/{id}` | Xóa banner |

Các endpoint trên là đường dẫn controller, chưa bao gồm prefix `/api/v1` khi gọi qua API Gateway.

## 6. Cấu hình môi trường

| Biến | Ý nghĩa |
|---|---|
| `PAYMENT_URL` | JDBC URL của Payment Database |
| `MYSQL_USERNAME` | Tài khoản MySQL |
| `MYSQL_PASSWORD` | Mật khẩu MySQL |
| `PAYOS_CLIENT_ID` | PayOS Client ID |
| `PAYOS_API_KEY` | PayOS API Key |
| `PAYOS_CHECKSUM_KEY` | PayOS Checksum Key |
| `POST_DB` | MongoDB connection string |
| `EUREKA` | Địa chỉ Eureka Server |

## 7. Khởi động

```bash
cd mb-05/payment-service
mvn spring-boot:run
```

```bash
cd mb-05/post-service
mvn spring-boot:run
```

Yêu cầu trước khi chạy:

- MySQL đang hoạt động.
- MongoDB đang hoạt động.
- Discovery Service đang hoạt động.
- PayOS có thông tin xác thực hợp lệ nếu cần thực hiện thanh toán thật.
- Các service phụ thuộc được khởi động khi sử dụng OpenFeign.

## 8. Vai trò của MB-05 trong Shop Meal

MB-05 hoàn thiện hai nhóm nghiệp vụ quan trọng của hệ thống.

Payment Service chịu trách nhiệm quản lý thanh toán và tích hợp PayOS để xử lý giao dịch. Post Service cung cấp chức năng quản lý nội dung, banner và các bài viết liên quan đến sản phẩm, góp phần hoàn thiện giao diện và trải nghiệm mua sắm của người dùng.