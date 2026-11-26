# SHOP MEAL – INSTALLATION GUIDE

## 1. Yêu cầu phần cứng

Do hệ thống chạy nhiều container cùng lúc, bao gồm các dịch vụ backend, frontend và cơ sở dữ liệu, máy tính cần đáp ứng các yêu cầu phần cứng sau:

| Thành phần | Tối thiểu | Khuyến nghị |
|---|---:|---:|
| CPU | 4 cores | 8 cores trở lên |
| RAM | 8 GB | 16 GB trở lên |
| Ổ cứng trống | 20 GB | 40 GB trở lên |
| Kết nối mạng | Có Internet | Internet ổn định |

**Lưu ý:**
- RAM 8 GB có thể không đủ để vận hành toàn bộ hệ thống một cách ổn định.
- Nên sử dụng ổ SSD để cải thiện tốc độ khởi động container và truy xuất dữ liệu.
- Cần đảm bảo ổ cứng còn đủ dung lượng để lưu trữ Docker Images, Containers và Volumes.
- Nếu sử dụng máy ảo, cần phân bổ đủ CPU, RAM và dung lượng ổ cứng cho máy ảo.

## 2. Yêu cầu môi trường

Trước khi triển khai hệ thống, cần chuẩn bị:

- Docker Desktop hoặc Docker Engine.
- Docker Compose.
- Git để tải mã nguồn dự án.
- Kết nối Internet để tải các Docker Images cần thiết.

## 3. Hướng dẫn cài đặt

### 3.1. Tải mã nguồn

Clone dự án về máy tính:

```bash
git clone <repository-url>
```

Di chuyển vào thư mục dự án:

```bash
cd shop-meal
```

### 3.2. Cấu hình môi trường

Tạo file `.env` tại thư mục gốc của dự án.

```bash
cp .env.example .env
```

Nếu sử dụng Windows CMD:

```cmd
copy .env.example .env
```

Mở file `.env` và cấu hình các thông tin cần thiết:

- Thông tin đăng nhập MySQL.
- Thông tin đăng nhập MongoDB.
- Thông tin tài khoản MinIO.
- Thông tin xác thực Google OAuth.
- API Key của các dịch vụ bên ngoài.
- Thông tin cấu hình thanh toán PayOS.
- Các khóa và thời hạn sử dụng JWT.

Đảm bảo các giá trị trong file `.env` phù hợp với cấu hình trong `docker-compose.yml` và các service tương ứng.

### 3.3. Khởi chạy hệ thống

Mở terminal tại thư mục gốc của dự án và thực hiện:

```bash
docker compose up -d --build
```

Lệnh này sẽ:
- Build các Docker Images từ mã nguồn.
- Tải các Docker Images cần thiết.
- Tạo các container.
- Khởi chạy các dịch vụ theo cấu hình Docker Compose.

### 3.4. Kiểm tra trạng thái

Kiểm tra các container:

```bash
docker compose ps
```

Theo dõi log của toàn bộ hệ thống:

```bash
docker compose logs -f
```

Theo dõi log của một service cụ thể:

```bash
docker compose logs -f <service-name>
```

### 3.5. Truy cập hệ thống

Sau khi các container khởi chạy thành công, có thể truy cập các dịch vụ thông qua trình duyệt:

| Dịch vụ | Địa chỉ |
|---|---|
| Website | http://localhost |
| API Gateway | http://localhost:8888 |
| Eureka Dashboard | http://localhost:8761 |
| MinIO Console | http://localhost:9001 |

Các địa chỉ trên sử dụng cổng mặc định được ánh xạ trong Docker Compose. Nếu thay đổi cấu hình cổng, cần truy cập bằng cổng tương ứng.

## 4. Quản lý hệ thống

### 4.1. Dừng hệ thống

Dừng các container nhưng giữ nguyên dữ liệu:

```bash
docker compose stop
```

### 4.2. Khởi động lại hệ thống

```bash
docker compose start
```

### 4.3. Khởi động lại toàn bộ container

```bash
docker compose restart
```

### 4.4. Build lại và khởi động hệ thống

Sử dụng khi có thay đổi mã nguồn:

```bash
docker compose up -d --build
```

### 4.5. Xóa các container

```bash
docker compose down
```

Lệnh này xóa các container và network do Compose tạo ra, nhưng không xóa dữ liệu trong named volumes.

### 4.6. Xóa toàn bộ dữ liệu

```bash
docker compose down -v
```

**Cảnh báo:** Lệnh này xóa cả các volumes, đồng nghĩa với việc dữ liệu trong MySQL, MongoDB, Redis, Elasticsearch và MinIO có thể bị mất. Chỉ sử dụng khi thực sự muốn triển khai lại từ đầu.

## 5. Xử lý sự cố thường gặp

| Sự cố | Hướng xử lý |
|---|---|
| Docker không khởi động | Kiểm tra Docker Desktop hoặc Docker Engine |
| Container liên tục khởi động lại | Kiểm tra log bằng `docker compose logs -f` |
| Không thể tải Docker Image | Kiểm tra kết nối Internet và Docker Hub |
| Không thể kết nối cơ sở dữ liệu | Kiểm tra trạng thái container và thông tin cấu hình trong `.env` |
| Không truy cập được website | Kiểm tra container frontend và cấu hình cổng |
| Không truy cập được API | Kiểm tra API Gateway và trạng thái các backend service |
| Máy tính thiếu bộ nhớ | Tăng RAM cấp cho Docker hoặc đóng các ứng dụng không cần thiết |

---

**Lưu ý:** Không chỉnh sửa trực tiếp cấu hình bên trong container đang chạy. Khi cần thay đổi cấu hình hoặc mã nguồn, hãy cập nhật file tương ứng trong dự án và build lại container bằng Docker Compose.