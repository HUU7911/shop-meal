# MB-02 Bui Huy Son – Product Service & File Service

## 1. Giới thiệu

MB-02 phụ trách quản lý dữ liệu sản phẩm và tài nguyên hình ảnh trong hệ thống Shop Meal.

Nhóm bao gồm 2 Microservices:

| Microservice | Chức năng | Port |
|---|---|---:|
| Product Service | Quản lý món ăn và danh mục | 8083 |
| File Service | Quản lý upload và download file | 8088 |

## 2. Kiến trúc và luồng hoạt động

```text
              Frontend
                  |
                  v
             API Gateway
                  |
          +-------+-------+
          |               |
          v               v
    Product Service   File Service
        :8083             :8088
          |               |
          v               v
        MySQL           MongoDB
                          |
                          v
                         MinIO

          Product Service
                  |
                  v
                 Kafka
                  |
                  v
             Search Service
```

Product Service quản lý thông tin món ăn và danh mục. File Service quản lý metadata của file và hỗ trợ lưu trữ tài nguyên trên MinIO.

## 3. Chi tiết các Microservice

### 3.1. Product Service

**Vai trò:**

Quản lý toàn bộ dữ liệu sản phẩm và danh mục món ăn của Shop Meal.

**Chức năng:**

- Tạo món ăn mới.
- Lấy danh sách món ăn.
- Lấy thông tin món ăn theo ID.
- Lấy snapshot và thông tin sản phẩm.
- Cập nhật thông tin món ăn.
- Xóa món ăn.
- Quản lý danh mục sản phẩm.
- Tạo danh mục.
- Lấy danh sách danh mục.
- Cập nhật danh mục.
- Xóa danh mục.
- Phát sinh sự kiện khi sản phẩm được tạo, cập nhật hoặc xóa.
- Gửi sự kiện qua Kafka để đồng bộ dữ liệu sang Search Service.

**Các thành phần chính:**

- Food
- Category
- FoodRepository
- CategoryRepository
- FoodService
- CategoryService
- FoodController
- CategoryController

**Công nghệ:**

- Spring Boot
- Spring Data JPA
- Spring Security
- MySQL
- Redis
- Apache Kafka
- Spring Cloud Netflix Eureka Client
- OpenFeign

**Database:** `food_db`

**Port:** `8083`

**Context Path:** `/product`

### 3.2. File Service

**Vai trò:**

Quản lý tài nguyên file được sử dụng trong hệ thống Shop Meal.

**Chức năng:**

- Upload file.
- Download file theo File ID.
- Lưu thông tin metadata của file.
- Quản lý thông tin file thông qua FileMgmt.
- Sử dụng MinIO để lưu trữ tài nguyên.
- Hỗ trợ các service khác truy cập file thông qua API.

**Các thành phần chính:**

- FileMgmt
- FileInfo
- FileData
- FileService
- FileController
- FileMgmtMapper
- FileRepository
- MinIOConfig

**Công nghệ:**

- Spring Boot
- Spring Data MongoDB
- Spring Security
- JWT
- MinIO
- OpenFeign

**Database:** `file_db`

**Port:** `8088`

**Context Path:** `/file`

## 4. Cơ chế đồng bộ dữ liệu sản phẩm

Product Service và Search Service sử dụng Kafka để đồng bộ dữ liệu.

Luồng hoạt động:

```text
Admin
  |
  v
Product Service
  |
  | Create / Update / Delete
  v
FoodService
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

Khi sản phẩm được tạo, cập nhật hoặc xóa, Product Service phát sinh sự kiện tương ứng. Search Service tiếp nhận sự kiện và cập nhật dữ liệu tìm kiếm.

## 5. API chính

### Product Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/product/category/create` | Tạo danh mục |
| GET | `/product/category` | Lấy danh sách danh mục |
| PUT | `/product/category/update/{name}` | Cập nhật danh mục |
| DELETE | `/product/category/delete/{name}` | Xóa danh mục |
| POST | `/product/food/create` | Tạo món ăn |
| GET | `/product/food` | Lấy danh sách món ăn |
| GET | `/product/food/{id}` | Lấy món ăn theo ID |
| GET | `/product/food/snapshot/{id}` | Lấy snapshot |
| GET | `/product/food/info/{id}` | Lấy thông tin món ăn |
| PUT | `/product/food/update/{id}` | Cập nhật món ăn |
| DELETE | `/product/food/delete/{id}` | Xóa món ăn |

### File Service

| Method | Endpoint | Chức năng |
|---|---|---|
| POST | `/file/media/upload` | Upload file |
| GET | `/file/media/download/{fileId}` | Download file |

Các endpoint trên là đường dẫn controller, chưa bao gồm prefix `/api/v1` khi gọi qua API Gateway.

## 6. Cấu hình môi trường

| Biến | Ý nghĩa |
|---|---|
| `PRODUCT_URL` | JDBC URL của Product Database |
| `FILE_URL` | MongoDB connection string |
| `MYSQL_USERNAME` | Tài khoản MySQL |
| `MYSQL_PASSWORD` | Mật khẩu MySQL |
| `EUREKA` | Địa chỉ Eureka Server |
| `ENDPOINT` | MinIO Endpoint |
| `ACCESS_KEY` | MinIO Access Key |
| `SECRET_KEY` | MinIO Secret Key |
| `BUCKET` | Tên bucket lưu trữ |

## 7. Khởi động

```bash
cd mb-02/product-service
mvn spring-boot:run
```

```bash
cd mb-02/file-service
mvn spring-boot:run
```

Yêu cầu trước khi chạy:

- MySQL đang hoạt động.
- MongoDB đang hoạt động.
- MinIO đang hoạt động và bucket đã được tạo.
- Discovery Service đang hoạt động.
- Kafka đang hoạt động nếu sử dụng chức năng đồng bộ tìm kiếm.

## 8. Vai trò của MB-02 trong Shop Meal

MB-02 chịu trách nhiệm quản lý dữ liệu món ăn, danh mục và tài nguyên hình ảnh. Đây là nhóm cung cấp dữ liệu sản phẩm cho frontend, đồng thời cung cấp sự kiện cho Search Service để đồng bộ dữ liệu tìm kiếm.