# MB-04 Nguyen Quoc Tuan – Notification Service & Search Service

## 1. Giới thiệu

MB-04 phụ trách hai chức năng hỗ trợ quan trọng của Shop Meal: gửi thông báo và tìm kiếm sản phẩm.

Nhóm bao gồm 2 Microservices:

| Microservice | Chức năng | Port |
|---|---|---:|
| Notification Service | Gửi thông báo và email | 8082 |
| Search Service | Tìm kiếm sản phẩm | 8084 |

## 2. Kiến trúc và luồng hoạt động

```text
       Product Service
              |
              | Product Events
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

       Identity / Order
              |
              | Notification Events
              v
            Kafka
              |
              v
      Notification Service
              |
              v
          Brevo API
              |
              v
        User Email
```

Hai service sử dụng Kafka để tiếp nhận và xử lý các sự kiện được phát sinh từ những thành phần khác trong hệ thống.

## 3. Chi tiết các Microservice

### 3.1. Notification Service

**Vai trò:**

Phụ trách gửi thông báo và email trong hệ thống Shop Meal.

**Chức năng:**

- Tiếp nhận các sự kiện thông báo.
- Xử lý thông tin người nhận.
- Gửi email thông qua dịch vụ Brevo.
- Cung cấp API gửi email.
- Hỗ trợ xử lý thông báo từ các nghiệp vụ liên quan.

**Các thành phần chính:**

- NotificationController
- EmailController
- NotificationEvent
- Các thành phần xử lý Kafka Consumer.

**Công nghệ:**

- Spring Boot
- Spring Data MongoDB
- Apache Kafka
- Brevo API
- Spring Cloud Netflix Eureka Client

**Database:** MongoDB (`notification_db`)

**Port:** `8082`

**Context Path:** `/notification`

### 3.2. Search Service

**Vai trò:**

Cung cấp chức năng tìm kiếm sản phẩm trong Shop Meal.

**Chức năng:**

- Tiếp nhận yêu cầu tìm kiếm sản phẩm.
- Truy vấn dữ liệu sản phẩm trong Elasticsearch.
- Tiếp nhận sự kiện từ Kafka.
- Đồng bộ dữ liệu sản phẩm khi có sự kiện tạo, cập nhật hoặc xóa.
- Quản lý dữ liệu tìm kiếm thông qua Elasticsearch.

**Các thành phần chính:**

- SearchController
- SearchService
- Elasticsearch Repository và các thành phần liên quan.
- Các Kafka Consumer xử lý sự kiện sản phẩm.

**Công nghệ:**

- Spring Boot
- Spring Data Elasticsearch
- Elasticsearch Java Client
- Apache Kafka
- Redis
- Spring Cloud Netflix Eureka Client

**Database tìm kiếm:** Elasticsearch (`products` index theo thiết kế đồng bộ dữ liệu)

**Port:** `8084`

**Context Path:** `/search`

## 4. Cơ chế đồng bộ dữ liệu tìm kiếm

Search Service không phụ thuộc vào việc truy vấn trực tiếp MySQL của Product Service. Dữ liệu tìm kiếm được đồng bộ thông qua Kafka.

Luồng xử lý:

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
          Event Consumer
                |
                v
           Elasticsearch
                |
                v
             products
```

Các loại sự kiện sản phẩm được sử dụng trong quá trình đồng bộ gồm:

- CREATED
- UPDATED
- DELETED

Khi Search Service nhận được sự kiện, service thực hiện cập nhật dữ liệu tương ứng trong Elasticsearch.

## 5. API chính

### Notification Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/notification/email/send` | Gửi email |

### Search Service

| Method | Endpoint | Chức năng |
|---|---|---|
| GET | `/search/product` | Tìm kiếm sản phẩm |

Các endpoint trên là đường dẫn controller, chưa bao gồm prefix `/api/v1` khi gọi qua API Gateway.

## 6. Cấu hình môi trường

| Biến | Ý nghĩa |
|---|---|
| `NOTIFICATION_SERVICE_DB` | MongoDB connection string |
| `API_KEY_BREVO` | API Key của Brevo |
| `ELASTIC_SEARCH` | Địa chỉ Elasticsearch |
| `SPRING_KAFKA_BOOTSTRAP_SERVERS` | Kafka Bootstrap Servers |
| `EUREKA` | Địa chỉ Eureka Server |
| `SPRING_DATA_REDIS_HOST` | Redis Host |
| `SPRING_DATA_REDIS_PORT` | Redis Port |

## 7. Khởi động

```bash
cd mb-04/notification-service
mvn spring-boot:run
```

```bash
cd mb-04/search-service
mvn spring-boot:run
```

Yêu cầu trước khi chạy:

- MongoDB đang hoạt động.
- Kafka đang hoạt động.
- Elasticsearch đang hoạt động.
- Discovery Service đang hoạt động.
- Brevo API Key hợp lệ nếu cần gửi email thật.

## 8. Vai trò của MB-04 trong Shop Meal

MB-04 hỗ trợ nâng cao trải nghiệm người dùng và khả năng khai thác dữ liệu sản phẩm.

Notification Service đảm nhiệm việc gửi thông báo qua email, trong khi Search Service cung cấp khả năng tìm kiếm dựa trên Elasticsearch và cập nhật dữ liệu thông qua cơ chế giao tiếp bất đồng bộ Kafka.