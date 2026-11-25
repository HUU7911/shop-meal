# MB-03 Nguyen Bat Quan – Cart Service & Order Service

## 1. Giới thiệu

MB-03 phụ trách xử lý nghiệp vụ giỏ hàng và đặt hàng trong hệ thống Shop Meal.

Nhóm bao gồm 2 Microservices:

| Microservice | Chức năng | Port |
|---|---|---:|
| Cart Service | Quản lý giỏ hàng | 8085 |
| Order Service | Quản lý đơn hàng | 8086 |
| Socket.IO Server | Giao tiếp realtime của Order Service | 8099 |

## 2. Kiến trúc và luồng hoạt động

```text
                 Customer
                     |
                     v
                API Gateway
                     |
              +------+------+
              |             |
              v             v
          Cart Service  Order Service
             :8085         :8086
              |             |
              v             v
             MySQL         MySQL
                            |
               +------------+------------+
               |                         |
               v                         v
          Product Service           Payment Service
               |                         |
               +------------+------------+
                            |
                            v
                         Kafka
                            |
                            v
                    Notification Service
```

Socket.IO Server được tích hợp trong Order Service để hỗ trợ giao tiếp realtime.

## 3. Chi tiết các Microservice

### 3.1. Cart Service

**Vai trò:**

Quản lý giỏ hàng của khách hàng trước khi tạo đơn hàng.

**Chức năng:**

- Thêm sản phẩm vào giỏ hàng.
- Lấy thông tin giỏ hàng hiện tại.
- Xóa một sản phẩm khỏi giỏ hàng.
- Xóa toàn bộ giỏ hàng.
- Quản lý thông tin các sản phẩm trong giỏ.
- Xác định thông tin người dùng thông qua cơ chế xác thực JWT.

**Các thành phần chính:**

- CartController
- CartService
- CartRepository
- Các Entity và DTO phục vụ nghiệp vụ giỏ hàng.

**Công nghệ:**

- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- OpenFeign

**Database:** `cart_db`

**Port:** `8085`

**Context Path:** `/cart`

### 3.2. Order Service

**Vai trò:**

Quản lý quá trình tạo và xử lý đơn hàng của khách hàng.

**Chức năng:**

- Tạo đơn hàng từ giỏ hàng.
- Tạo đơn hàng mua ngay.
- Lấy danh sách đơn hàng của người dùng hiện tại.
- Lấy chi tiết đơn hàng theo ID.
- Quản lý đơn hàng dành cho Admin.
- Giao tiếp với Cart Service và các service liên quan thông qua OpenFeign.
- Phối hợp với Payment Service để xử lý thanh toán.
- Phát sinh và tiếp nhận các sự kiện nghiệp vụ qua Kafka.
- Hỗ trợ giao tiếp realtime bằng Socket.IO.

**Các thành phần chính:**

- OrderController
- OrderAdminController
- OrderService
- OrderRepository
- Order Entity
- SocketIOConfig

**Công nghệ:**

- Spring Boot
- Spring Data JPA
- Spring Security
- JWT
- MySQL
- Apache Kafka
- OpenFeign
- Socket.IO

**Database:** `order_db`

**Port:** `8086`

**Context Path:** `/order`

**Socket.IO Port:** `8099`

## 4. Luồng nghiệp vụ đặt hàng

```text
Customer
   |
   v
Cart Service
   |
   | Get Cart
   v
Order Service
   |
   | Validate Products
   v
Product Service
   |
   | Create Order
   v
Order Database
   |
   | Create Payment
   v
Payment Service
   |
   | Payment Result
   v
Order Processing
   |
   v
Notification Service
```

Đây là luồng tổng quan thể hiện sự phối hợp giữa các service trong nghiệp vụ đặt hàng và thanh toán.

## 5. API chính

### Cart Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/cart/add` | Thêm sản phẩm vào giỏ |
| GET | `/cart/my-cart` | Lấy giỏ hàng hiện tại |
| DELETE | `/cart/items/{itemId}` | Xóa sản phẩm khỏi giỏ |
| DELETE | `/cart/clear-my-cart` | Xóa toàn bộ giỏ hàng |

### Order Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/order/create` | Tạo đơn hàng |
| POST | `/order/buyNow/create` | Tạo đơn hàng mua ngay |
| GET | `/order/my-orders` | Lấy đơn hàng của người dùng |
| GET | `/order/{id}` | Lấy chi tiết đơn hàng |
| GET | `/order/admin` | Quản lý danh sách đơn hàng Admin |

Các endpoint trên là đường dẫn controller, chưa bao gồm prefix `/api/v1` khi gọi qua API Gateway.

## 6. Giao tiếp giữa các service

### OpenFeign

Order Service sử dụng cơ chế gọi HTTP giữa các Microservice để lấy thông tin cần thiết cho quá trình tạo đơn hàng.

### Kafka

Kafka hỗ trợ giao tiếp bất đồng bộ thông qua các sự kiện nghiệp vụ, giúp các service liên quan xử lý những công việc tiếp theo mà không cần phụ thuộc hoàn toàn vào request đồng bộ.

### Socket.IO

Socket.IO hỗ trợ giao tiếp realtime giữa backend và frontend, phục vụ việc cập nhật thông tin đơn hàng.

## 7. Cấu hình môi trường

| Biến | Ý nghĩa |
|---|---|
| `CART_URL` | JDBC URL của Cart Database |
| `ORDER_URL` | JDBC URL của Order Database |
| `MYSQL_USERNAME` | Tài khoản MySQL |
| `MYSQL_PASSWORD` | Mật khẩu MySQL |
| `EUREKA` | Địa chỉ Eureka Server |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | Kafka Bootstrap Servers |

## 8. Khởi động

```bash
cd mb-03/cart-service
mvn spring-boot:run
```

```bash
cd mb-03/order-service
mvn spring-boot:run
```

Yêu cầu trước khi chạy:

- MySQL đang hoạt động.
- Discovery Service đang hoạt động.
- Kafka đang hoạt động nếu sử dụng xử lý sự kiện.
- Các service phụ thuộc như Product, Payment và Profile đã được khởi động khi cần thiết.

## 9. Vai trò của MB-03 trong Shop Meal

MB-03 là nhóm xử lý nghiệp vụ giao dịch cốt lõi của hệ thống. Cart Service quản lý sản phẩm khách hàng lựa chọn, trong khi Order Service chịu trách nhiệm tạo và quản lý đơn hàng, phối hợp với các service khác để hoàn thiện quá trình mua hàng.