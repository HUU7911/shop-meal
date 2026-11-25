# MB-01 Tran Tri Huu – API Gateway, Discovery, Identity & Profile

## 1. Giới thiệu

MB-01 phụ trách các thành phần nền tảng của hệ thống Shop Meal, bao gồm điều phối request, đăng ký và khám phá dịch vụ, xác thực người dùng, phân quyền và quản lý thông tin cá nhân.

Nhóm bao gồm 4 Microservices:

| Microservice | Chức năng | Port |
|---|---|---:|
| API Gateway | Tiếp nhận và định tuyến request | 8888 |
| Discovery Service | Đăng ký và khám phá Microservice | 8761 |
| Identity Service | Xác thực và phân quyền người dùng | 8080 |
| Profile Service | Quản lý hồ sơ người dùng | 8081 |

## 2. Kiến trúc và luồng hoạt động

```text
                Client / Web App
                       |
                       v
                API Gateway
                   :8888
                       |
          +------------+-------------+
          |            |             |
          v            v             v
      Identity      Profile      Other Services
      Service       Service
       :8080         :8081
          |            |
          v            v
       MySQL         MySQL
          |
          v
     Redis / Kafka

       Discovery Service
             :8761
          (Eureka)
```

API Gateway là điểm tiếp nhận request từ frontend. Các Microservice đăng ký với Discovery Service để hỗ trợ tìm kiếm và giao tiếp thông qua tên dịch vụ.

## 3. Chi tiết các Microservice

### 3.1. API Gateway

**Vai trò:**

API Gateway là cổng giao tiếp duy nhất giữa frontend và các Microservice backend.

**Chức năng:**

- Định tuyến request đến Microservice tương ứng.
- Sử dụng Eureka và Spring Cloud LoadBalancer để tìm kiếm dịch vụ.
- Kiểm tra JWT và xác thực request.
- Kiểm tra quyền truy cập.
- Giới hạn số lượng request bằng Rate Limiting.
- Sử dụng Redis hỗ trợ giới hạn request.
- Cấu hình CORS cho frontend.

**Công nghệ:**

- Spring Boot
- Spring Cloud Gateway WebFlux
- Spring Security
- Spring Cloud Netflix Eureka Client
- Spring Cloud LoadBalancer
- Redis

**Port:** `8888`

### 3.2. Discovery Service

**Vai trò:**

Quản lý đăng ký và khám phá các Microservice trong hệ thống.

**Chức năng:**

- Cung cấp Eureka Server.
- Nhận đăng ký từ các Microservice.
- Duy trì danh sách dịch vụ đang đăng ký.
- Hỗ trợ API Gateway và các service tìm kiếm nhau thông qua service name.

**Công nghệ:**

- Spring Boot
- Spring Cloud Netflix Eureka Server

**Port:** `8761`

**Dashboard:** http://localhost:8761

### 3.3. Identity Service

**Vai trò:**

Quản lý danh tính, tài khoản và quyền truy cập của người dùng.

**Chức năng:**

- Đăng ký tài khoản.
- Đăng nhập và đăng xuất.
- Phát hành JWT Access Token.
- Refresh Token.
- Introspect Token.
- Thu hồi token thông qua danh sách token bị vô hiệu hóa.
- Quản lý User.
- Quản lý Role và Permission.
- Đăng nhập thông qua Google OAuth.
- Quên mật khẩu và xác thực OTP.
- Giới hạn số lần đăng nhập thất bại.

**Các thành phần chính:**

- User
- Role
- Permission
- InvalidateToken

**Công nghệ:**

- Spring Boot
- Spring Security
- Spring OAuth2 Resource Server
- JWT
- Spring Data JPA
- MySQL
- Redis
- Kafka
- OpenFeign

**Database:** `identity_db`

**Port:** `8080`

**Context Path:** `/identity`

### 3.4. Profile Service

**Vai trò:**

Quản lý thông tin hồ sơ cá nhân của người dùng sau khi tài khoản được tạo trong Identity Service.

**Chức năng:**

- Tạo hồ sơ người dùng.
- Lấy thông tin hồ sơ.
- Lấy hồ sơ theo User ID.
- Lấy hồ sơ của người dùng hiện tại.
- Cập nhật hồ sơ.
- Xóa hồ sơ.
- Cập nhật ảnh đại diện.
- Mã hóa một số trường thông tin thông qua EncryptConvertor.
- Cache dữ liệu bằng Redis.

**Các thành phần chính:**

- Profile
- ProfileRepository
- ProfileService
- ProfileController
- ProfileMapper
- EncryptConvertor

**Công nghệ:**

- Spring Boot
- Spring Security
- JWT
- Spring Data JPA
- MySQL
- Redis
- MapStruct
- OpenFeign

**Database:** `profile_db`

**Port:** `8081`

**Context Path:** `/profile`

## 4. API chính

### Identity Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/identity/auth/login` | Đăng nhập |
| POST | `/identity/auth/introspect` | Kiểm tra token |
| POST | `/identity/auth/logout` | Đăng xuất |
| POST | `/identity/auth/refresh` | Làm mới token |
| POST | `/identity/auth/outbound/identity` | Google OAuth |
| POST | `/identity/auth/forgot-password` | Quên mật khẩu |
| POST | `/identity/auth/verify-otp` | Xác thực OTP |
| POST | `/identity/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/identity/users` | Danh sách người dùng |
| POST | `/identity/users/create` | Tạo người dùng |

### Profile Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/profile` | Tạo hồ sơ |
| GET | `/profile` | Lấy hồ sơ |
| GET | `/profile/users/{id}` | Lấy hồ sơ theo ID |
| GET | `/profile/my-profile` | Hồ sơ hiện tại |
| PUT | `/profile/update` | Cập nhật hồ sơ |
| DELETE | `/profile/delete/{userId}` | Xóa hồ sơ |
| POST | `/profile/update/avatar` | Cập nhật avatar |

Các endpoint trên là đường dẫn controller, chưa bao gồm prefix `/api/v1` khi gọi từ frontend qua Gateway.

## 5. Cấu hình môi trường

Các biến môi trường chính:

| Biến | Ý nghĩa |
|---|---|
| `IDENTITY_URL` | JDBC URL của Identity Database |
| `PROFILE_URL` | JDBC URL của Profile Database |
| `MYSQL_USERNAME` | Tài khoản MySQL |
| `MYSQL_PASSWORD` | Mật khẩu MySQL |
| `SIGNER_KEY` | Khóa ký JWT |
| `VALID_DURATION` | Thời hạn Access Token |
| `REFRESHABLE_DURATION` | Thời hạn Refresh Token |
| `CLIENT_ID` | Google OAuth Client ID |
| `CLIENT_SECRET` | Google OAuth Client Secret |
| `REDIRECT_URL` | URL callback OAuth |
| `EUREKA` | Địa chỉ Eureka Server |

## 6. Khởi động

Chạy từng service trong thư mục tương ứng:

```bash
cd mb-01/discovery-service
mvn spring-boot:run
```

```bash
cd mb-01/identity-service
mvn spring-boot:run
```

```bash
cd mb-01/profile-service
mvn spring-boot:run
```

```bash
cd mb-01/api-gateway
mvn spring-boot:run
```

Thứ tự khuyến nghị:

1. Discovery Service.
2. Identity Service và Profile Service.
3. API Gateway.

## 7. Vai trò của MB-01 trong Shop Meal

MB-01 là nhóm dịch vụ nền tảng, chịu trách nhiệm quản lý danh tính, xác thực, phân quyền và điều phối request. Các nhóm Microservice khác sử dụng JWT để bảo vệ tài nguyên và sử dụng Eureka để khám phá dịch vụ trong hệ thống.