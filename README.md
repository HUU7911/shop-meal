# 🍔 Shop Meal - Food Ordering Microservices

Hệ thống **đặt món ăn trực tuyến** được xây dựng theo kiến trúc **Microservices** sử dụng Spring Boot.

Project bao gồm nhiều service độc lập, giao tiếp với nhau thông qua API Gateway, Service Discovery và các cơ chế giao tiếp giữa các service.

---

## Member

---
1. Trần Trí Hữu
2. Nguyễn Bật Quân
3. Lê Phú Quý
4. Bùi Huy Sơn
5. Nguyễn Quốc Tuấn
---

## 🏗️ Architecture

```text
                           ┌───────────────────┐
                           │      Web App      │
                           │   React / Vite    │
                           └─────────┬─────────┘
                                     │
                                     ▼
                           ┌───────────────────┐
                           │    API Gateway    │
                           │      :8080        │
                           └─────────┬─────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │   Identity  │       │   Product   │       │   Profile   │
       │   Service   │       │   Service   │       │   Service   │
       └─────────────┘       └─────────────┘       └─────────────┘
              │                      │                      │
              └──────────────────────┼──────────────────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ Cart Service│       │ Order       │       │  Payment    │
       │             │       │ Service     │       │  Service    │
       └─────────────┘       └─────────────┘       └─────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │   Notification  │
                            │     Service     │
                            └─────────────────┘

                    ┌────────────────────────────┐
                    │       Infrastructure      │
                    │                            │
                    │  Discovery Service        │
                    │  Search Service            │
                    │  Database                  │
                    │  Message Broker            │
                    └────────────────────────────┘
```

---

## 📁 Project Structure

```text
shop-meal/
│
├── .idea/
│
├── api-gateway/
│   └── API Gateway
│
├── cart-service/
│   └── Shopping Cart Service
│
├── discovery-service/
│   └── Service Discovery
│
├── identity-service/
│   └── Authentication & Authorization
│
├── notification-service/
│   └── Notification Service
│
├── order-service/
│   └── Order Management
│
├── payment-service/
│   └── Payment Processing
│
├── product-service/
│   └── Product Management
│
├── profile-service/
│   └── User Profile Management
│
├── search-service/
│   └── Product Search
│
├── web-app/
│   └── Frontend Application
│
├── .env
├── docker-compose.yaml
├── pom.xml
└── README.md
```

---

# 🚀 Services

| Service | Description |
|---|---|
| `api-gateway` | Entry point của hệ thống |
| `discovery-service` | Service Discovery |
| `identity-service` | Authentication và Authorization |
| `profile-service` | Quản lý thông tin người dùng |
| `product-service` | Quản lý sản phẩm |
| `search-service` | Tìm kiếm sản phẩm |
| `cart-service` | Quản lý giỏ hàng |
| `order-service` | Quản lý đơn hàng |
| `payment-service` | Xử lý thanh toán |
| `notification-service` | Gửi thông báo |
| `web-app` | Frontend của hệ thống |

---

# 🛠️ Technologies

## Backend

- Java
- Spring Boot
- Spring Cloud
- Spring Security
- Spring Data JPA
- Spring WebFlux
- Spring Cloud Gateway
- OpenFeign
- OAuth2 / JWT
- Maven

## Frontend

- React
- TypeScript
- Vite
- HTML
- CSS
- JavaScript

## Database

- MySQL / PostgreSQL
- MongoDB

## Infrastructure

- Docker
- Docker Compose
- Service Discovery
- API Gateway

## Other Technologies

- Kafka
- Elasticsearch
- REST API
- JWT
- Git / GitHub

---

# 🔐 Authentication

Hệ thống sử dụng **JWT (JSON Web Token)** để xác thực người dùng.

Flow authentication:

```text
User
 │
 ▼
Web App
 │
 ▼
API Gateway
 │
 ▼
Identity Service
 │
 ├── Login
 │
 ├── Generate JWT
 │
 └── Validate Token
 │
 ▼
Protected Services
```

Sau khi đăng nhập thành công:

```text
Access Token
      │
      ▼
Web Application
      │
      ▼
API Gateway
      │
      ▼
JWT Validation
      │
      ▼
Microservice
```

---

# 🔄 Request Flow

Client gửi request tới API Gateway:

```text
Client
  │
  ▼
API Gateway
  │
  ├── Authentication
  │
  ├── Authorization
  │
  └── Routing
       │
       ▼
  Microservice
       │
       ▼
    Database
```

Ví dụ:

```text
GET /api/v1/products
```

Request:

```text
Web App
   │
   ▼
API Gateway
   │
   ▼
Product Service
   │
   ▼
Product Database
```

---

# 📦 Microservices

## 1. API Gateway

API Gateway là entry point của hệ thống.

Nhiệm vụ:

- Routing request
- Authentication
- Authorization
- Load balancing
- Forward request tới các microservice
- Centralized security

---

## 2. Discovery Service

Service Discovery giúp các microservice tìm thấy nhau mà không cần hard-code địa chỉ của service.

```text
                 Discovery Service
                 /       |       \
                /        |        \
               ▼         ▼         ▼
          Product     Order      Payment
           Service    Service     Service
```

---

## 3. Identity Service

Quản lý:

- User
- Login
- Register
- Password
- JWT
- Authentication
- Authorization
- Token validation

Ví dụ API:

```http
POST /auth/login
```

```http
POST /auth/register
```

```http
POST /auth/introspect
```

---

## 4. Product Service

Quản lý:

- Product
- Category
- Product detail
- Price
- Images
- Product information

Ví dụ:

```http
GET /products
```

```http
GET /products/{id}
```

```http
POST /products
```

```http
PUT /products/{id}
```

```http
DELETE /products/{id}
```

---

## 5. Search Service

Dùng để tìm kiếm sản phẩm.

Ví dụ:

```http
GET /search/products?q=burger
```

Có thể sử dụng:

```text
Elasticsearch
```

để hỗ trợ tìm kiếm nhanh và full-text search.

---

## 6. Cart Service

Quản lý giỏ hàng của người dùng.

Các chức năng:

- Add product
- Remove product
- Update quantity
- Get cart
- Clear cart

Flow:

```text
User
 │
 ▼
Cart
 │
 ├── Product A
 ├── Product B
 └── Product C
```

---

## 7. Order Service

Quản lý đơn hàng.

Các trạng thái có thể bao gồm:

```text
PENDING
   │
   ▼
CONFIRMED
   │
   ▼
PROCESSING
   │
   ▼
COMPLETED
```

Hoặc:

```text
PENDING
   │
   └──────► CANCELLED
```

---

## 8. Payment Service

Xử lý thanh toán đơn hàng.

Flow:

```text
Order Service
      │
      ▼
Payment Service
      │
      ▼
Payment Gateway
      │
      ▼
Payment Result
```

---

## 9. Notification Service

Gửi thông báo tới người dùng.

Có thể sử dụng:

- Email
- Kafka
- Event-driven architecture

Ví dụ:

```text
Order Created
      │
      ▼
Kafka Event
      │
      ▼
Notification Service
      │
      ▼
Email / Notification
```

---

## 10. Profile Service

Quản lý thông tin cá nhân:

- Full name
- Avatar
- Phone
- Address
- User information

---

# 🔎 Search Architecture

Search Service có thể sử dụng Elasticsearch:

```text
Product Service
      │
      │ Product Event
      ▼
Message Broker
      │
      ▼
Search Service
      │
      ▼
Elasticsearch
```

Khi user tìm kiếm:

```text
User
 │
 ▼
API Gateway
 │
 ▼
Search Service
 │
 ▼
Elasticsearch
 │
 ▼
Search Result
```

---

# 📨 Event-Driven Architecture

Một số service có thể giao tiếp thông qua event.

Ví dụ khi tạo user:

```text
Identity Service
      │
      ▼
User Created Event
      │
      ▼
Kafka
      │
      ▼
Notification Service
      │
      ▼
Send Notification
```

Ví dụ khi tạo order:

```text
Order Service
      │
      ▼
Order Created Event
      │
      ├──────────────► Notification Service
      │
      └──────────────► Payment Service
```

---

# 🐳 Docker

Project sử dụng Docker Compose để chạy các infrastructure service.

Các container có thể bao gồm:

```text
Docker Compose
│
├── Database
├── MongoDB
├── Kafka
├── Elasticsearch
└── Other Infrastructure
```

Khởi động Docker:

```bash
docker compose up -d
```

Kiểm tra container:

```bash
docker ps
```

Dừng toàn bộ container:

```bash
docker compose down
```

---

# ⚙️ Environment Variables

Tạo file:

```text
.env
```

Ví dụ:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=shop_meal
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password

JWT_SECRET=your_secret_key

KAFKA_HOST=localhost
KAFKA_PORT=9092

ELASTICSEARCH_HOST=localhost
ELASTICSEARCH_PORT=9200
```

> Không commit thông tin nhạy cảm vào GitHub.

---

# ▶️ Running the Project

## 1. Clone project

```bash
git clone https://github.com/HUU7911/shop-meal.git
```

```bash
cd shop-meal
```

---

## 2. Start Infrastructure

```bash
docker compose up -d
```

Kiểm tra:

```bash
docker ps
```

---

## 3. Build Project

Nếu sử dụng Maven:

```bash
mvn clean install
```

Hoặc:

```bash
./mvnw clean install
```

---

## 4. Run Services

Có thể chạy từng service bằng Maven:

```bash
cd discovery-service
mvn spring-boot:run
```

Sau đó:

```bash
cd ../identity-service
mvn spring-boot:run
```

```bash
cd ../product-service
mvn spring-boot:run
```

```bash
cd ../order-service
mvn spring-boot:run
```

---

# 🌐 Frontend

Di chuyển vào thư mục:

```bash
cd web-app
```

Cài dependencies:

```bash
npm install
```

Chạy development server:

```bash
npm run dev
```

Frontend sẽ kết nối tới API Gateway.

---

# 🧪 Testing API

Có thể sử dụng:

- Postman
- Swagger
- Browser
- Frontend application

Ví dụ:

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "username": "admin",
  "password": "123456"
}
```

Response:

```json
{
  "code": 200,
  "message": "Login successfully",
  "result": {
    "token": "JWT_TOKEN"
  }
}
```

---

# 🔒 Security

Các API public:

```text
/auth/login
/auth/register
/auth/introspect
```

Các API protected yêu cầu:

```http
Authorization: Bearer <access-token>
```

Ví dụ:

```http
GET /api/v1/products
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
```

---

# 📊 System Flow

Luồng đặt món tổng quát:

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Web App    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ API Gateway  │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
          Product        Cart         Profile
          Service       Service       Service
              │            │
              └──────┬─────┘
                     │
                     ▼
                Order Service
                     │
                     ▼
               Payment Service
                     │
                     ▼
             Notification Service
```

---

# 📌 Main Features

- [x] User Authentication
- [x] JWT Authentication
- [x] User Profile
- [x] Product Management
- [x] Category Management
- [x] Product Search
- [x] Shopping Cart
- [x] Order Management
- [x] Payment Service
- [x] Notification Service
- [x] API Gateway
- [x] Service Discovery
- [x] Docker Compose
- [x] Microservices Architecture
- [x] Event-driven Communication

---

# 🧩 Project Architecture

Project được thiết kế theo kiến trúc:

```text
Microservices
      │
      ├── API Gateway
      │
      ├── Service Discovery
      │
      ├── Authentication
      │
      ├── Business Services
      │
      ├── Event-driven Services
      │
      └── Infrastructure
```

Mục tiêu của project là xây dựng một hệ thống **Food Ordering Platform** có khả năng mở rộng, tách biệt trách nhiệm giữa các service và dễ dàng phát triển thêm các chức năng mới.

---

# 👨‍💻 Author

**HUU7911**

GitHub:

```text
https://github.com/HUU7911
```

---

# 📄 License

This project is for learning and development purposes.