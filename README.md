# 🍔 SHOP MEAL – FOOD ORDERING MICROSERVICES SYSTEM

**Shop Meal** là hệ thống thương mại điện tử chuyên về đặt món ăn trực tuyến, được phát triển theo kiến trúc **Microservices**. Hệ thống cung cấp các chức năng quản lý sản phẩm, danh mục, tài khoản, giỏ hàng, đơn hàng, thanh toán, tìm kiếm và quản lý nội dung.

Dự án sử dụng **Spring Boot, Spring Cloud, React, TypeScript** cùng các công nghệ lưu trữ và xử lý dữ liệu như **MySQL, MongoDB, Redis, Apache Kafka, Elasticsearch và MinIO**.

---

## 📑 Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. System Architecture](#2-system-architecture)
- [3. Project Structure](#3-project-structure)
- [4. Microservices Description](#4-microservices-description)
- [5. Technology Stack](#5-technology-stack)
- [6. Database Architecture](#6-database-architecture)
- [7. Inter-Service Communication](#7-inter-service-communication)
- [8. Authentication and Authorization](#8-authentication-and-authorization)
- [9. Main Business Workflows](#9-main-business-workflows)
- [10. API Gateway](#10-api-gateway)
- [11. Frontend Application](#11-frontend-application)
- [12. Environment Configuration](#12-environment-configuration)
- [13. Installation and Running](#13-installation-and-running)
- [14. Docker Deployment](#14-docker-deployment)
- [15. Development Guidelines](#15-development-guidelines)

---

# 1. Project Overview

## 1.1. Introduction

Shop Meal được xây dựng nhằm mô phỏng một hệ thống đặt món ăn trực tuyến với khả năng phân chia nghiệp vụ thành các dịch vụ độc lập.

Thay vì xây dựng ứng dụng theo kiến trúc Monolithic, hệ thống sử dụng Microservices để phân tách các chức năng nghiệp vụ thành những service riêng biệt. Mỗi service chịu trách nhiệm quản lý một phạm vi nghiệp vụ cụ thể và có thể giao tiếp với các service khác thông qua REST API, OpenFeign hoặc Apache Kafka.

## 1.2. Main Features

### Customer

- Đăng ký và đăng nhập tài khoản.
- Đăng nhập bằng Google OAuth.
- Quên mật khẩu và xác thực OTP.
- Xem danh sách món ăn.
- Tìm kiếm món ăn.
- Xem thông tin chi tiết sản phẩm.
- Quản lý giỏ hàng.
- Đặt món trực tuyến.
- Thanh toán đơn hàng.
- Theo dõi trạng thái đơn hàng.
- Quản lý thông tin cá nhân.
- Xem bài viết và nội dung liên quan đến sản phẩm.

### Administrator

- Quản lý người dùng.
- Quản lý sản phẩm.
- Quản lý danh mục món ăn.
- Quản lý đơn hàng.
- Quản lý bài viết.
- Quản lý banner.
- Theo dõi và quản lý các nghiệp vụ liên quan đến hệ thống.

---

# 2. System Architecture

## 2.1. Microservices Architecture

Hệ thống được chia thành 5 nhóm Microservices, bao gồm 12 service độc lập.

```text
                         CLIENT
                           |
              +------------+------------+
              |                         |
              v                         v
         React Web App              Admin UI
              |                         |
              +------------+------------+
                           |
                           v
                    API GATEWAY
                       :8888
                           |
              +------------+-------------+
              |            |             |
              v            v             v
          MB-01          MB-02         MB-03
        Identity       Product         Cart
        Profile          File          Order
        Discovery
              |            |             |
              +------------+-------------+
                           |
              +------------+-------------+
              |                          |
              v                          v
            MB-04                      MB-05
         Notification                 Payment
           Search                      Post
              |                          |
              +------------+-------------+
                           |
                           v
                    INFRASTRUCTURE
                           |
       +----------+--------+--------+----------+
       |          |        |        |          |
       v          v        v        v          v
     MySQL     MongoDB   Redis    Kafka   Elasticsearch
                                          |
                                          v
                                         MinIO
```

## 2.2. Main Components

| Component | Responsibility |
|---|---|
| API Gateway | Tiếp nhận, xác thực và định tuyến request |
| Discovery Service | Đăng ký và khám phá Microservice |
| Identity Service | Quản lý danh tính và xác thực |
| Profile Service | Quản lý hồ sơ người dùng |
| Product Service | Quản lý món ăn và danh mục |
| File Service | Quản lý tài nguyên file |
| Cart Service | Quản lý giỏ hàng |
| Order Service | Quản lý đơn hàng |
| Notification Service | Gửi email và xử lý thông báo |
| Search Service | Tìm kiếm và đồng bộ dữ liệu |
| Payment Service | Xử lý thanh toán |
| Post Service | Quản lý bài viết và banner |

## 2.3. Architectural Principles

Hệ thống áp dụng các nguyên tắc:

- **Single Responsibility:** Mỗi Microservice phụ trách một nhóm nghiệp vụ riêng.
- **Database per Service:** Mỗi service sở hữu dữ liệu nghiệp vụ của mình.
- **Service Discovery:** Các service đăng ký và khám phá nhau thông qua Eureka.
- **API Gateway Pattern:** Tập trung điều phối request từ client.
- **Event-Driven Architecture:** Sử dụng Kafka cho giao tiếp bất đồng bộ.
- **Loose Coupling:** Giảm sự phụ thuộc trực tiếp giữa các service.
- **Centralized Authentication:** Sử dụng JWT để xác thực request.

---

# 3. Project Structure

```text
shop-meal-master/
│
├── mb-01/
│   ├── README.md
│   ├── api-gateway/
│   ├── discovery-service/
│   ├── identity-service/
│   └── profile-service/
│
├── mb-02/
│   ├── README.md
│   ├── product-service/
│   └── file-service/
│
├── mb-03/
│   ├── README.md
│   ├── cart-service/
│   └── order-service/
│
├── mb-04/
│   ├── README.md
│   ├── notification-service/
│   └── search-service/
│
├── mb-05/
│   ├── README.md
│   ├── payment-service/
│   └── post-service/
│
├── web-app/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── data-source/
│   ├── post/
│   │   ├── post.json
│   │   └── post_for_product.json
│   │
│   └── product/
│       ├── categories.json
│       └── products.json
│
├── scripts/
│
├── pom.xml
├── Dockerfile
├── docker-compose.yaml
├── .env.example
├── .dockerignore
└── README.md
```

### Project Modules

| Group | Microservices |
|---|---|
| MB-01 | API Gateway, Discovery, Identity, Profile |
| MB-02 | Product, File |
| MB-03 | Cart, Order |
| MB-04 | Notification, Search |
| MB-05 | Payment, Post |

Mỗi nhóm có một file README riêng mô tả nhiệm vụ, kiến trúc và cách hoạt động của các service thành viên.

---

# 4. Microservices Description

## 4.1. MB-01 – API Gateway, Discovery, Identity & Profile

### API Gateway

Là điểm tiếp nhận request từ frontend và định tuyến đến các Microservice.

Chức năng:

- Routing.
- Authentication.
- Authorization.
- Rate Limiting.
- CORS Configuration.
- Service Load Balancing.

Port: `8888`

### Discovery Service

Sử dụng Eureka Server để quản lý danh sách Microservice.

Chức năng:

- Service Registration.
- Service Discovery.
- Quản lý trạng thái đăng ký của service.

Port: `8761`

### Identity Service

Quản lý tài khoản và danh tính người dùng.

Chức năng:

- Register.
- Login.
- Logout.
- JWT Access Token.
- Refresh Token.
- Token Introspection.
- Role-Based Authorization.
- Google OAuth.
- OTP Verification.
- Password Reset.
- Token Invalidation.

Port: `8080`

### Profile Service

Quản lý hồ sơ cá nhân của người dùng.

Chức năng:

- Create Profile.
- Get Profile.
- Update Profile.
- Delete Profile.
- Update Avatar.
- Encrypt Sensitive Fields.
- Redis Caching.

Port: `8081`

## 4.2. MB-02 – Product & File

### Product Service

Quản lý thông tin món ăn và danh mục.

Chức năng:

- Product Management.
- Category Management.
- Product Information.
- Product Snapshot.
- Product Events.
- Redis Caching.
- Kafka Event Publishing.

Port: `8083`

### File Service

Quản lý tài nguyên file.

Chức năng:

- File Upload.
- File Download.
- File Metadata Management.
- MinIO Object Storage Integration.

Port: `8088`

## 4.3. MB-03 – Cart & Order

### Cart Service

Quản lý giỏ hàng của người dùng.

Chức năng:

- Add Cart Item.
- Get Cart.
- Remove Cart Item.
- Clear Cart.
- Cart Management.

Port: `8085`

### Order Service

Quản lý nghiệp vụ đơn hàng.

Chức năng:

- Create Order.
- Buy Now.
- Get User Orders.
- Get Order Details.
- Admin Order Management.
- Payment Coordination.
- Kafka Event Processing.
- Realtime Order Communication.

Port: `8086`

Socket.IO Server: `8099`

## 4.4. MB-04 – Notification & Search

### Notification Service

Quản lý thông báo và gửi email.

Chức năng:

- Notification Processing.
- Kafka Consumer.
- Email Sending.
- Brevo Integration.

Port: `8082`

### Search Service

Cung cấp chức năng tìm kiếm sản phẩm.

Chức năng:

- Product Search.
- Elasticsearch Integration.
- Kafka Consumer.
- Product Event Synchronization.
- Redis Caching.

Port: `8084`

## 4.5. MB-05 – Payment & Post

### Payment Service

Quản lý thanh toán đơn hàng.

Chức năng:

- Create Payment.
- PayOS Integration.
- Payment Webhook.
- Payment Status Management.
- Payment Expiration Scheduling.
- Payment Event Processing.

Port: `8087`

### Post Service

Quản lý nội dung bài viết và banner.

Chức năng:

- Post Management.
- Banner Management.
- Product-related Posts.
- Content Management.
- Integration with Product, Profile and File Services.

Port: `8089`

---

# 5. Technology Stack

## 5.1. Backend

| Technology | Purpose |
|---|---|
| Java 25 | Programming Language |
| Spring Boot 4.1.2 | Backend Framework |
| Spring Cloud | Microservices Infrastructure |
| Spring Cloud Gateway | API Gateway |
| Spring Cloud Netflix Eureka | Service Discovery |
| Spring Security | Authentication & Authorization |
| Spring Data JPA | Relational Database Access |
| Spring Data MongoDB | Document Database Access |
| Spring Data Redis | Caching |
| Spring Data Elasticsearch | Search Integration |
| Spring Cloud OpenFeign | Inter-Service REST Communication |
| Spring WebFlux | Reactive Web Framework |
| Spring Kafka | Event-Driven Communication |
| JWT | Token-based Authentication |
| MapStruct | Object Mapping |
| Lombok | Boilerplate Code Reduction |
| Maven | Dependency Management and Build |

## 5.2. Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI Library |
| TypeScript | Static Typing |
| Vite 6 | Frontend Build Tool |
| Material UI 6 | UI Components |
| Axios | HTTP Client |
| React Router DOM | Client-side Routing |
| Socket.IO Client | Realtime Communication |

## 5.3. Database & Storage

| Technology | Purpose |
|---|---|
| MySQL 8 | Relational Database |
| MongoDB | Document Database |
| Redis 8 | Caching and Rate Limiting |
| Elasticsearch 9 | Full-text Search |
| MinIO | Object Storage |

## 5.4. Message Broker

- Apache Kafka 4.x.

## 5.5. DevOps & Tools

- Docker.
- Docker Compose.
- Nginx.
- IntelliJ IDEA.
- Postman.
- MySQL Workbench.
- MongoDB Compass.
- DBeaver.
- Git & GitHub.

---

# 6. Database Architecture

Shop Meal sử dụng mô hình Database per Service. Mỗi Microservice sở hữu database riêng, hạn chế việc truy cập trực tiếp dữ liệu của service khác.

## 6.1. MySQL

| Database | Owner Service |
|---|---|
| `identity_db` | Identity Service |
| `profile_db` | Profile Service |
| `food_db` | Product Service |
| `cart_db` | Cart Service |
| `order_db` | Order Service |
| `payment_db` | Payment Service |

MySQL được sử dụng cho dữ liệu có cấu trúc và các nghiệp vụ cần quản lý quan hệ dữ liệu.

## 6.2. MongoDB

| Database | Owner Service |
|---|---|
| `file_db` | File Service |
| `notification_db` | Notification Service |
| `post_db` | Post Service |

MongoDB được sử dụng để lưu trữ dữ liệu dạng document.

## 6.3. Redis

Redis được sử dụng trong các chức năng:

- Caching dữ liệu.
- Giảm truy vấn lặp lại đến database.
- Hỗ trợ Rate Limiting tại API Gateway.
- Lưu trữ dữ liệu cache trong các service được cấu hình.

## 6.4. Elasticsearch

Search Service sử dụng Elasticsearch để lưu trữ và truy vấn dữ liệu phục vụ tìm kiếm sản phẩm.

Index sản phẩm được đồng bộ từ Product Service thông qua Kafka.

## 6.5. MinIO

MinIO cung cấp object storage để lưu trữ hình ảnh và các tài nguyên file.

File Service đảm nhiệm việc quản lý metadata và giao tiếp với MinIO.

---

# 7. Inter-Service Communication

Shop Meal sử dụng hai cơ chế giao tiếp chính giữa các Microservice.

## 7.1. Synchronous Communication – OpenFeign

OpenFeign hỗ trợ các service gọi REST API của nhau thông qua HTTP.

Ví dụ:

```text
          Order Service
                |
                | OpenFeign
                v
          Cart Service
                |
                v
          Cart Response
                |
                v
          Order Service
```

Các trường hợp sử dụng:

- Order Service lấy dữ liệu giỏ hàng.
- Order Service lấy thông tin sản phẩm.
- Post Service lấy thông tin sản phẩm.
- Post Service lấy thông tin hồ sơ.
- Các service truy cập chức năng của File Service.

## 7.2. Asynchronous Communication – Kafka

Kafka hỗ trợ giao tiếp bất đồng bộ thông qua các event.

Ví dụ đồng bộ dữ liệu sản phẩm:

```text
       Product Service
              |
              v
        Product Event
              |
              v
            Kafka
              |
              v
        Search Service
              |
              v
        Kafka Consumer
              |
              v
        Elasticsearch
```

Các sự kiện sản phẩm:

- CREATED
- UPDATED
- DELETED

Khi Product Service thay đổi dữ liệu sản phẩm, sự kiện tương ứng được gửi đến Kafka. Search Service tiếp nhận và cập nhật dữ liệu tìm kiếm trong Elasticsearch.

Kafka cũng được sử dụng để hỗ trợ trao đổi các sự kiện nghiệp vụ liên quan đến Notification Service và các service khác.

---

# 8. Authentication and Authorization

## 8.1. JWT Authentication

Hệ thống sử dụng JSON Web Token để xác thực người dùng.

Quy trình đăng nhập:

```text
       User
        |
        v
    Web App
        |
        v
   API Gateway
        |
        v
 Identity Service
        |
        v
   Verify Account
        |
        v
 Generate JWT
        |
        v
 Return Access Token
        |
        v
    Web App
```

Sau khi đăng nhập thành công, frontend sử dụng Access Token trong các request cần xác thực.

```text
Authorization: Bearer <access_token>
```

## 8.2. Request Authentication

```text
       Client
          |
          v
     API Gateway
          |
          v
    Authentication
          |
          v
      JWT Token
          |
          v
     Authorization
          |
          v
     Route Request
          |
          v
      Microservice
```

API Gateway thực hiện kiểm tra thông tin xác thực và quyền truy cập theo cấu hình bảo mật.

## 8.3. Role-Based Access Control

Hệ thống sử dụng Role và Permission để quản lý quyền truy cập.

Một số nhóm quyền nghiệp vụ:

- CUSTOMER.
- ADMIN.

Các chức năng quản trị được bảo vệ bằng cơ chế phân quyền.

---

# 9. Main Business Workflows

## 9.1. User Registration and Login

```text
       Customer
           |
           v
        Web App
           |
           v
      API Gateway
           |
           v
     Identity Service
           |
           v
       MySQL
           |
           v
      Create Account
           |
           v
      Login / JWT
           |
           v
       Web App
```

## 9.2. Product Management

```text
       Administrator
              |
              v
          API Gateway
              |
              v
        Product Service
              |
              v
            MySQL
              |
              v
        Product Event
              |
              v
            Kafka
              |
              v
         Search Service
              |
              v
         Elasticsearch
```

## 9.3. Shopping Cart and Order

```text
          Customer
              |
              v
          Cart Service
              |
              v
          Cart Database
              |
              v
          Order Service
              |
              v
        Validate Products
              |
              v
          Create Order
              |
              v
          Order Database
```

## 9.4. Payment Processing

```text
         Customer
             |
             v
        Order Service
             |
             v
       Payment Service
             |
             v
            PayOS
             |
             v
      Payment Webhook
             |
             v
       Payment Service
             |
             v
      Update Payment
             |
             v
        Order Workflow
```

Payment Service tích hợp PayOS để tạo giao dịch và tiếp nhận kết quả thanh toán thông qua webhook.

## 9.5. Product Search

```text
         Product Service
                |
                v
           Product Event
                |
                v
              Kafka
                |
                v
          Search Service
                |
                v
           Elasticsearch
                |
                v
             Search API
                |
                v
             Frontend
```

## 9.6. File Upload

```text
           Frontend
               |
               v
          API Gateway
               |
               v
           File Service
               |
          +----+----+
          |         |
          v         v
       MongoDB    MinIO
       Metadata   File Storage
```

---

# 10. API Gateway

API Gateway là điểm truy cập tập trung của các API backend.

**Base URL:**

```text
http://localhost:8888/api/v1
```

## 10.1. Routing Configuration

| Service | Gateway Path | Internal Service |
|---|---|---|
| Identity | `/api/v1/identity/**` | Identity Service |
| Profile | `/api/v1/profile/**` | Profile Service |
| Notification | `/api/v1/notification/**` | Notification Service |
| Product | `/api/v1/product/**` | Product Service |
| Search | `/api/v1/search/**` | Search Service |
| Cart | `/api/v1/cart/**` | Cart Service |
| Order | `/api/v1/order/**` | Order Service |
| Payment | `/api/v1/payment/**` | Payment Service |
| File | `/api/v1/file/**` | File Service |
| Post | `/api/v1/post/**` | Post Service |

## 10.2. Example Requests

```http request
GET http://localhost:8888/api/v1/product/food
```

```http request
GET http://localhost:8888/api/v1/cart/my-cart
```

```http request
GET http://localhost:8888/api/v1/order/my-orders
```

```http request
GET http://localhost:8888/api/v1/search/product
```

Lưu ý: Đường dẫn cụ thể và HTTP method phải tuân theo mapping được khai báo trong Controller của từng service.

---

# 11. Frontend Application

Frontend được phát triển bằng React và TypeScript, sử dụng Material UI để xây dựng giao diện.

## 11.1. Main Modules

| Module | Description |
|---|---|
| Authentication | Đăng nhập, đăng ký và xác thực |
| Menu | Hiển thị danh sách món ăn |
| Product Detail | Chi tiết món ăn |
| Cart | Quản lý giỏ hàng |
| Checkout | Đặt hàng và thanh toán |
| Orders | Quản lý đơn hàng |
| Profile | Quản lý hồ sơ |
| My Posts | Quản lý bài viết cá nhân |
| Admin Products | Quản lý sản phẩm |
| Admin Categories | Quản lý danh mục |
| Admin Orders | Quản lý đơn hàng |
| Admin Users | Quản lý người dùng |
| Admin Posts | Quản lý bài viết |
| Admin Banners | Quản lý banner |

## 11.2. Frontend Technologies

- React 18.
- TypeScript.
- Vite.
- Material UI.
- Axios.
- React Router DOM.
- Socket.IO Client.

## 11.3. API Configuration

Frontend sử dụng biến môi trường:

```dotenv
VITE_API_BASE_URL=http://localhost:8888/api/v1
VITE_SOCKET_URL=http://localhost:8099
```

---

# 12. Environment Configuration

Dự án sử dụng `.env` để quản lý các biến môi trường.

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

## 12.1. Database Configuration

```dotenv
MYSQL_USERNAME=root
MYSQL_PASSWORD=your_mysql_password
```

## 12.2. JWT Configuration

```dotenv
SIGNER_KEY=your_jwt_signer_key
VALID_DURATION=3600
REFRESHABLE_DURATION=36000
```

## 12.3. MongoDB Configuration

```dotenv
FILE_URL=mongodb://root:password@localhost:27017/file_db?authSource=admin

NOTIFICATION_SERVICE_DB=mongodb://root:password@localhost:27017/notification_db?authSource=admin

POST_DB=mongodb://root:password@localhost:27017/post_db?authSource=admin
```

## 12.4. MinIO Configuration

```dotenv
ENDPOINT=http://localhost:9000
ACCESS_KEY=your_access_key
SECRET_KEY=your_secret_key
BUCKET=shop-meal
```

## 12.5. Elasticsearch Configuration

```dotenv
ELASTIC_SEARCH=http://localhost:9200
```

Các thông tin xác thực Elasticsearch cần được cấu hình tương ứng với chế độ bảo mật đang sử dụng.

## 12.6. Kafka Configuration

```dotenv
SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## 12.7. Google OAuth Configuration

```dotenv
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REDIRECT_URL=http://localhost:5173/authenticate
```

## 12.8. Brevo Configuration

```dotenv
API_KEY_BREVO=your_brevo_api_key
```

## 12.9. PayOS Configuration

```dotenv
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

Không commit file `.env` chứa thông tin xác thực thật lên GitHub.

---

# 13. Installation and Running

## 13.1. Prerequisites

Cài đặt các công cụ:

| Tool | Requirement |
|---|---|
| JDK | Java 25 |
| Maven | 3.9+ |
| Node.js | 22+ |
| npm | Đi kèm Node.js |
| MySQL | 8.x |
| MongoDB | 8.x |
| Redis | 8.x |
| Apache Kafka | 4.x |
| Elasticsearch | 9.x |
| MinIO | Compatible Object Storage |

Có thể sử dụng Docker để chạy các thành phần hạ tầng thay vì cài đặt từng công cụ trực tiếp trên máy.

## 13.2. Clone Project

```bash
git clone https://github.com/HUU7911/shop-meal.git
cd shop-meal-master
```

## 13.3. Configure Environment

```bash
cp .env.example .env
```

Cập nhật thông tin kết nối database, Kafka, Redis, Elasticsearch, MinIO và các dịch vụ bên ngoài.

## 13.4. Start Infrastructure

Tại thư mục gốc:

```bash
docker compose up -d
```

Kiểm tra các container:

```bash
docker compose ps
```

Lưu ý: Docker Compose cần được cấu hình đầy đủ cho các thành phần hạ tầng trước khi chạy backend. Các service backend cũng cần có các biến môi trường tương ứng với cấu hình của từng `application.yaml`.

## 13.5. Build Backend

Tại thư mục gốc:

```bash
mvn clean package -DskipTests
```

Lệnh trên sử dụng Maven parent POM để build các module backend.

## 13.6. Run Backend Services

Khởi động Discovery Service trước:

```bash
cd mb-01/discovery-service
mvn spring-boot:run
```

Tiếp theo khởi động các service nghiệp vụ.

Ví dụ:

```bash
cd mb-01/identity-service
mvn spring-boot:run
```

```bash
cd mb-02/product-service
mvn spring-boot:run
```

```bash
cd mb-03/order-service
mvn spring-boot:run
```

Cuối cùng khởi động API Gateway:

```bash
cd mb-01/api-gateway
mvn spring-boot:run
```

Mỗi service có thể được chạy trong một terminal riêng.

## 13.7. Run Frontend

Mở terminal tại thư mục `web-app`:

```bash
cd web-app
npm install
```

Chạy frontend:

```bash
npm run dev
```

Frontend mặc định sử dụng Vite Development Server.

Truy cập:

```text
http://localhost:5173
```

---

# 14. Docker Deployment

Shop Meal sử dụng Docker và Docker Compose để containerize các thành phần của hệ thống.

## 14.1. Docker Architecture

```text
                  Docker Host
                       |
                 Docker Network
                       |
       +---------------+----------------+
       |               |                |
       v               v                v
    Frontend        API Gateway    Infrastructure
     Nginx              |                |
       |                |                |
       |          +-----+------+         |
       |          |            |         |
       |          v            v         |
       |       Identity     Product      |
       |       Profile      Order        |
       |       Cart         Payment      |
       |       Search       Post         |
       |       File         Notification |
       |                               |
       +-------------------------------+
                       |
                       v
             Database / Storage
```

## 14.2. Build and Run

Kiểm tra cấu hình:

```bash
docker compose config
```

Build images:

```bash
docker compose build
```

Khởi động container:

```bash
docker compose up -d
```

Kiểm tra trạng thái:

```bash
docker compose ps
```

Theo dõi logs:

```bash
docker compose logs -f
```

## 14.3. Docker Management

Dừng hệ thống:

```bash
docker compose down
```

Khởi động lại:

```bash
docker compose restart
```

Build lại một service:

```bash
docker compose up -d --build product-service
```

Xóa container và volume:

```bash
docker compose down -v
```

**Warning:** Lệnh `docker compose down -v` sẽ xóa dữ liệu trong các persistent volumes. Chỉ sử dụng khi thực sự muốn reset dữ liệu.

## 14.4. Nginx

Nginx được sử dụng để phục vụ frontend build và reverse proxy request đến backend.

Các luồng chính:

| Path | Destination |
|---|---|
| `/` | React Frontend |
| `/api/` | API Gateway |
| `/socket.io/` | Order Service Socket.IO |

---

# 15. Development Guidelines

## 15.1. Microservice Independence

Mỗi service cần quản lý riêng:

- Business Logic.
- Controller.
- Service Layer.
- Repository.
- Entity.
- DTO.
- Configuration.
- Database Connection.

Không truy cập trực tiếp database thuộc quyền sở hữu của service khác.

## 15.2. Inter-Service Communication

Ưu tiên sử dụng:

- OpenFeign cho giao tiếp REST đồng bộ.
- Kafka cho giao tiếp bất đồng bộ thông qua event.

## 15.3. Security

- Không lưu mật khẩu dưới dạng plaintext.
- Sử dụng JWT cho xác thực.
- Kiểm tra quyền truy cập tại các API cần bảo vệ.
- Không đưa secret key vào source code.
- Không commit file `.env` chứa thông tin nhạy cảm.

## 15.4. Git Workflow

Đặt tên branch theo chức năng:

```text
feature/identity-service
feature/product-service
feature/payment-service
fix/order-service
```

Commit message nên mô tả rõ thay đổi:

```text
feat: add product management
feat: implement JWT authentication
fix: resolve order payment status
refactor: improve service communication
```

---

# 📌 Project Summary

| Category | Technology / Quantity |
|---|---|
| Architecture | Microservices |
| Backend Services | 12 |
| Service Groups | 5 |
| Backend Framework | Spring Boot 4.1.2 |
| Programming Language | Java 25 |
| Frontend | React + TypeScript |
| Frontend Build Tool | Vite |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Authentication | Spring Security + JWT |
| Synchronous Communication | OpenFeign / REST |
| Asynchronous Communication | Apache Kafka |
| Relational Database | MySQL |
| Document Database | MongoDB |
| Cache | Redis |
| Search Engine | Elasticsearch |
| Object Storage | MinIO |
| Containerization | Docker |
| Reverse Proxy | Nginx |

---

## 👨‍💻 Project

**Shop Meal – Online Food Ordering System**

A Microservices-based food ordering platform built with Spring Boot, Spring Cloud, React and distributed infrastructure technologies.

**Main objectives:**

- Apply Microservices Architecture.
- Implement API Gateway and Service Discovery.
- Implement authentication and authorization using JWT.
- Apply synchronous and asynchronous service communication.
- Integrate relational and NoSQL databases.
- Implement distributed caching and search.
- Integrate third-party payment and email services.
- Containerize application components using Docker.