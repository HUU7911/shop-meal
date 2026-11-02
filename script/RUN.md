# Shop Meal - Hướng dẫn chạy dự án

Hệ thống đặt món ăn theo kiến trúc microservices (Spring Boot 4.1.1, Spring Cloud) và frontend React + Vite.
Tài liệu này hướng dẫn chạy toàn bộ dự án trên máy local (Windows/Linux/macOS).

## 1. Yêu cầu cài đặt

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| JDK | **25** | Khai báo `java.version=25` trong tất cả `pom.xml` |
| Maven | 3.9+ | Hoặc dùng `mvnw` có sẵn trong từng service |
| Docker Desktop | mới | Chạy MySQL, MongoDB, Redis, Kafka, Elasticsearch, MinIO |
| Node.js | 20+ | Cho `web-app` (Vite 6) |
| IntelliJ IDEA | khuyên dùng | Chạy từng service dễ hơn, xem mục 5 |

## 2. Danh sách service và cổng

| Service | Cổng | Context path | Database / hạ tầng |
|---|---|---|---|
| `discovery-service` (Eureka) | 8761 | - | - |
| `api-gateway` | 8888 | prefix `/api/v1` | Eureka |
| `identity-service` | 8080 | `/identity` | MySQL `identity_db`, Redis, Kafka |
| `profile-service` | 8081 | `/profile` | MySQL `profile_db` |
| `notification-service` | 8082 | `/notification` | MongoDB, Kafka, Brevo (email) |
| `product-service` | 8083 | `/product` | MySQL `food_db`, Kafka |
| `search-service` | 8084 | `/search` | Elasticsearch, Kafka |
| `cart-service` | 8085 | `/cart` | MySQL `cart_db` |
| `order-service` | 8086 | `/order` | MySQL `order_db`, Kafka |
| `payment-service` | 8087 | `/payment` | MySQL `payment_db`, PayOS |
| `file-service` | 8088 | `/file` | MongoDB `file_db`, thư mục `./upload` |
| `post-service` | 8089 | `/post` | MongoDB `post_db` |
| `web-app` | 5173 | - | Gọi API qua gateway |

Mọi request từ frontend đi qua gateway, ví dụ `http://localhost:8888/api/v1/product/...` được chuyển tới `product-service`.

## 3. Bước 1: Lấy mã nguồn

```bash
git clone https://github.com/HUU7911/shop-meal.git
cd shop-meal
```

## 4. Bước 2: Chạy hạ tầng bằng Docker

```bash
docker compose up -d
docker ps
```

Compose khởi động các container: `broker` (Kafka), `shop-elasticsearch`, `shop-mysql`, `shop-mongodb`, `redis`, `shop-meal-minio`.

Một số lưu ý với `docker-compose.yaml` hiện tại:

- **Mật khẩu Elasticsearch**: `USERNAME` và `PASSWORD` trong compose không phải biến cấu hình hợp lệ của Elasticsearch (biến đúng là `ELASTIC_PASSWORD`). Vì vậy mật khẩu `elastic` sẽ được sinh ngẫu nhiên và bạn phải đặt lại ở mục 6.
- **Kafka**: service `broker` chưa có `ports` ánh xạ `9092:9092`. Nếu các service chạy trên máy host không kết nối được `localhost:9092`, hãy thêm vào `broker`:
  ```yaml
  ports:
    - "9092:9092"
  ```
- **MinIO**: có trong compose nhưng `file-service` hiện không dùng (dependency đang bị comment). File upload được lưu ở `./upload` và metadata ở MongoDB.
- **Mật khẩu mặc định** của MySQL, MongoDB, MinIO trong compose là `123456`.

## 5. Bước 3: Cấu hình biến môi trường (`.env`)

Các service đọc biến từ file `.env` ở **thư mục gốc** `shop-meal/` thông qua thư viện `dotenv-java`.

```bash
cp .env.example .env
```

Điền các giá trị vào `.env`:

| Nhóm | Biến | Ý nghĩa |
|---|---|---|
| Eureka | `EUREKA` | `http://localhost:8761/eureka/` |
| MySQL | `MYSQL_USERNAME`, `MYSQL_PASSWORD` | Trùng với compose (`root` / `123456`) |
| Identity | `IDENTITY_URL`, `SIGNER_KEY`, `VALID_DURATION`, `REFRESHABLE_DURATION` | JDBC URL, khóa ký JWT, thời hạn token (giây) |
| Google login | `CLIENT_ID`, `CLIENT_SECRET`, `REDIRECT_URL` | Tùy chọn, `REDIRECT_URL` phải khớp redirect URI ở web-app |
| Profile / Product / Cart / Order / Payment | `PROFILE_URL`, `PRODUCT_URL`, `CART_URL`, `ORDER_URL`, `PAYMENT_URL` | JDBC URL của từng DB (tự tạo DB nhờ `createDatabaseIfNotExist=true`) |
| Search | `PASSWORD`, `SSL` | Mật khẩu `elastic` và đường dẫn tới `http_ca.crt` (xem mục 6) |
| Notification | `API_KEY_BREVO`, `NOTIFICATION_SERVICE_DB` | API key Brevo gửi email, URI MongoDB |
| Payment | `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` | Lấy từ tài khoản PayOS |
| File / Post | `FILE_URL`, `POST_DB` | URI MongoDB, ví dụ `mongodb://root:123456@localhost:27017/post_db?authSource=admin` |

> **Quan trọng:** `dotenv-java` đọc file `.env` ở **thư mục làm việc hiện tại** (working directory).
> - Chạy trong IntelliJ: đặt **Working directory** của mỗi cấu hình chạy là thư mục gốc `shop-meal` (đường dẫn dạng `C:\Documents\Backend\shop-meal`).
> - Chạy bằng `mvn spring-boot:run` trong thư mục từng service thì sẽ không thấy `.env`. Hãy chạy từ thư mục gốc với `-Dspring-boot.run.workingDirectory=.`, hoặc đặt các biến thành biến môi trường hệ thống.

> **Lưu ý `file-service`:** file `file-service/src/main/resources/application.yaml` đang ghi cứng URI MongoDB (kèm mật khẩu khác với compose). Hãy đổi thành `uri: ${FILE_URL}` để dùng biến trong `.env`, nếu không service sẽ không đăng nhập được MongoDB.

## 6. Bước 4: Cấu hình Elasticsearch (chứng chỉ SSL)

`search-service` kết nối `https://localhost:9200` với user `elastic` và cần file chứng chỉ CA.

**6.1. Đặt lại mật khẩu `elastic`:**

```bash
docker exec -it shop-elasticsearch /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic --url https://localhost:9200
```

Gõ `y`, rồi copy mật khẩu in ra. Tham số `--url https://localhost:9200` là bắt buộc để tránh lỗi chứng chỉ không khớp IP nội bộ container (`exit code 69`).

**6.2. Copy chứng chỉ từ container ra máy:**

```bash
mkdir certs
docker cp shop-elasticsearch:/usr/share/elasticsearch/config/certs/http_ca.crt ./certs/http_ca.crt
```

**6.3. Kiểm tra:**

```bash
curl --cacert ./certs/http_ca.crt -u "elastic:MAT_KHAU" https://localhost:9200
```

Thấy JSON có `cluster_name` và `version` là thành công.

**6.4. Điền vào `.env`:**

```env
PASSWORD=MAT_KHAU_VUA_RESET
SSL=file:C:/Documents/Backend/shop-meal/certs/http_ca.crt
```

Dùng đường dẫn **tuyệt đối** theo máy của bạn, dùng dấu `/` thay cho `\`. Đừng để lại đường dẫn mẫu như `C:\elasticsearch-8.x.x\...` (gây lỗi `FileNotFoundException`).

Chỉ cần làm lại 6.1 và 6.2 khi xóa và tạo lại container Elasticsearch.

## 7. Bước 5: Build

Từ thư mục gốc (parent `pom.xml` có đủ 12 module):

```bash
mvn clean install -DskipTests
```

Hoặc dùng `mvnw` / `mvnw.cmd` trong từng service.

## 8. Bước 6: Chạy các service theo đúng thứ tự

Chạy mỗi service ở một cửa sổ riêng (hoặc một cấu hình chạy riêng trong IntelliJ), chờ service trước khởi động xong rồi mới chạy service sau.

| Thứ tự | Service | Kiểm tra |
|---|---|---|
| 1 | `discovery-service` | Mở http://localhost:8761 |
| 2 | `identity-service`, `profile-service`, `file-service` | Thấy đã đăng ký trên Eureka |
| 3 | `product-service`, `search-service`, `post-service` | Đã đăng ký trên Eureka |
| 4 | `cart-service`, `order-service`, `payment-service`, `notification-service` | Đã đăng ký trên Eureka |
| 5 | `api-gateway` | Cổng 8888 hoạt động |

Chạy bằng Maven từ thư mục gốc:

```bash
mvn -pl discovery-service spring-boot:run
mvn -pl identity-service spring-boot:run -Dspring-boot.run.workingDirectory=.
```

Hoặc trong IntelliJ: mở thư mục gốc `shop-meal`, chạy lớp `*Application` của từng service (ví dụ `com.meal.search.SearchServiceApplication`) và nhớ đặt Working directory như ở mục 5.

Kafka topic được dùng (tự tạo khi có message): `create-user`, `internal-create-staff`, `password-reset-otp`, `order-notification`, `product-event`.

## 9. Bước 7: Chạy frontend

```bash
cd web-app
npm install
```

Tạo `web-app/.env` (hoặc copy từ `web-app/.env.example` nếu có):

```env
VITE_API_BASE_URL=http://localhost:8888/api/v1
VITE_GOOGLE_CLIENT_ID=
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/authenticate
```

```bash
npm run dev
```

Mở http://localhost:5173. Cổng 5173 đã nằm trong CORS của gateway và là `return-url` / `cancel-url` của PayOS.

Build production: `npm run build`, xem thử: `npm run preview`.

## 10. Tài khoản mặc định và kiểm thử API

- Tài khoản quản trị mặc định do `ApplicationInitConfig` tạo: **`admin` / `admin`** (hãy đổi mật khẩu khi triển khai thật).
- Có sẵn file Postman `shopmeal.postman_colection.json` ở thư mục gốc, import vào Postman để thử API.
- Các API cần đăng nhập gửi kèm header `Authorization: Bearer <access-token>`.
- Danh mục món mặc định do `product-service` tạo: `CAFE`, `NOODLE`, `RICE`, `MILK_TEA`.
- Dữ liệu tìm kiếm được đồng bộ vào Elasticsearch qua Kafka topic `product-event` khi `product-service` tạo/sửa món, nên cần chạy Kafka và `search-service` để tìm kiếm có kết quả.

## 11. Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `search-service` lỗi `FileNotFoundException ... http_ca.crt` | Biến `SSL` sai đường dẫn hoặc `.env` không được đọc | Sửa `SSL` thành đường dẫn thật, kiểm tra Working directory |
| Biến `${...}` báo `Could not resolve placeholder` | Không tìm thấy `.env` | Chạy từ thư mục gốc hoặc đặt biến môi trường hệ thống |
| `port is already allocated` khi `docker compose up` | Cổng 9200, 3306, 6379... đã bị chiếm | Dừng container/tiến trình cũ hoặc đổi cổng map. Xem bằng `docker ps -a` và `netstat -ano \| findstr :9200` |
| `reset-password` lỗi `exit code 69` | Kết nối bằng IP nội bộ container | Thêm `--url https://localhost:9200` |
| Service không kết nối được Kafka | Broker chưa publish cổng 9092 ra host | Thêm `ports: - "9092:9092"` cho `broker` |
| `file-service` lỗi xác thực MongoDB | URI Mongo bị ghi cứng với mật khẩu khác | Đổi sang `${FILE_URL}` (mục 5) |
| Gateway trả 503 / không tìm thấy service | Service chưa đăng ký Eureka | Mở http://localhost:8761 kiểm tra, chạy lại service |
| Frontend gọi API lỗi CORS | Chạy khác cổng 5173 / 3000 | Dùng cổng 5173 hoặc cập nhật CORS ở gateway |

## 12. Bảo mật

- Không commit `.env`, `certs/http_ca.crt` và mật khẩu lên Git công khai (`.gitignore` hiện đã loại `.env` và `target/`).
- Mật khẩu `123456` trong compose chỉ dùng cho môi trường dev local.