# Lấy file `http_ca.crt` của Elasticsearch chạy trên Docker (Windows) và kết nối từ Spring Boot

Tài liệu này tổng hợp các bước lấy chứng chỉ CA (`http_ca.crt`, còn gọi là `elastic-http-ca.crt`) từ container Elasticsearch đang chạy trên Docker, đặt lại mật khẩu user `elastic`, và cấu hình Spring Boot để kết nối qua HTTPS.

## Tổng quan

- Từ Elasticsearch 8.x, security được bật mặc định và kết nối dùng HTTPS với chứng chỉ tự ký.
- File `http_ca.crt` **không tạo bằng tay**. Elasticsearch tự sinh ra ở lần khởi động đầu tiên, bạn chỉ cần **copy từ container ra**.
- Vị trí file trong container: `/usr/share/elasticsearch/config/certs/http_ca.crt`

## Yêu cầu

- Docker Desktop đã cài và container Elasticsearch đang chạy (security bật).
- Project Spring Boot (ví dụ `search-service`) dùng `spring-boot-starter-data-elasticsearch`.

---

## Bước 1: Kiểm tra container đang chạy

```cmd
docker ps
```

Ghi lại **tên container** (ví dụ `shop-elasticsearch`) và **cổng** được map (ví dụ `9200`).

## Bước 2: Tạo thư mục chứa chứng chỉ trong project

```cmd
mkdir C:\Documents\Backend\shop-meal\search-service\src\main\resources\certs
```

## Bước 3: Copy file chứng chỉ từ container ra

```cmd
docker cp shop-elasticsearch:/usr/share/elasticsearch/config/certs/http_ca.crt C:\Documents\Backend\shop-meal\search-service\src\main\resources\certs\http_ca.crt
```

Thay `shop-elasticsearch` bằng tên container của bạn. Kiểm tra file đã có:

```cmd
dir C:\Documents\Backend\shop-meal\search-service\src\main\resources\certs
```

## Bước 4: Lấy hoặc đặt lại mật khẩu user `elastic`

Nếu đã biết mật khẩu (đặt qua biến `ELASTIC_PASSWORD` khi tạo container) thì bỏ qua bước này. Nếu chưa:

```cmd
docker exec -it shop-elasticsearch /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic --url https://localhost:9200
```

- Gõ `y` để xác nhận, rồi **copy mật khẩu** được in ra.
- Tham số `--url https://localhost:9200` là bắt buộc trong trường hợp này. Nếu thiếu, công cụ sẽ kết nối bằng IP nội bộ của container (ví dụ `172.18.0.5`), không khớp với chứng chỉ và báo lỗi `exit code 69`.
- Lệnh này **đổi mật khẩu** của user `elastic`. Nếu service khác đang dùng mật khẩu cũ thì cần cập nhật theo.

## Bước 5: Kiểm tra chứng chỉ và mật khẩu

```cmd
curl.exe --cacert C:\Documents\Backend\shop-meal\search-service\src\main\resources\certs\http_ca.crt -u "elastic:MAT_KHAU" https://localhost:9200
```

Nếu mật khẩu có ký tự đặc biệt (`=`, `_`...), hãy đặt cả `elastic:MAT_KHAU` trong dấu nháy kép. Thấy JSON có `cluster_name` và `version` là thành công.

## Bước 6: Cấu hình Spring Boot

### `application.yml`

```yaml
spring:
  elasticsearch:
    uris: https://localhost:9200
    username: elastic
    password: "${ELASTIC_PASSWORD}"
    restclient:
      ssl:
        bundle: es-bundle
  ssl:
    bundle:
      pem:
        es-bundle:
          truststore:
            certificate: "classpath:certs/http_ca.crt"
```

### `.env` (nếu project dùng `dotenv-java`) hoặc biến môi trường

```
ELASTIC_PASSWORD=MAT_KHAU
```

Nếu ghi mật khẩu trực tiếp vào yml thì phải đặt trong dấu nháy kép.

### Nếu để file chứng chỉ ngoài project

Dùng tiền tố `file:` và dấu `/` thay cho `\`:

```yaml
certificate: "file:C:/duong/dan/http_ca.crt"
```

## Bước 7: Build lại và chạy

Trong IntelliJ: **Build > Rebuild Project**, rồi chạy lại service. Cần build lại để file `.crt` được copy vào `target/classes`.

Hoặc dùng Maven:

```cmd
cd C:\Documents\Backend\shop-meal\search-service
mvn clean package -DskipTests
```

---

## Các lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
|---|---|---|
| `FileNotFoundException: C:\elasticsearch-8.x.x\config\certs\http_ca.crt` | Còn đường dẫn mẫu `8.x.x` (chỗ giữ chỗ) trong cấu hình | Tìm `elasticsearch-8.x.x` bằng `Ctrl+Shift+F` trong IntelliJ (kiểm tra `application.yml`, `application.properties`, `.env`) rồi thay bằng cấu hình ở Bước 6 |
| `The system cannot find the path specified` khi `copy` | Đường dẫn nguồn không tồn tại | Dùng `docker cp` thay vì `copy` nếu Elasticsearch chạy trên Docker |
| `port is already allocated` khi `docker run` | Đã có container khác chiếm cổng 9200 | Dùng lại container đó, hoặc đổi cổng map (ví dụ `-p 9201:9200` và sửa `uris` thành `https://localhost:9201`). Xóa container lỗi bằng `docker rm TEN_CONTAINER` |
| `docker cp` báo không thấy file | Security đang tắt hoặc đường dẫn khác | Thử `curl http://localhost:9200`. Nếu trả về JSON thì dùng `http://` và bỏ cấu hình SSL, username, password |
| `reset-password` lỗi `exit code 69`, `No subject alternative names matching IP address` | Công cụ kết nối bằng IP nội bộ container, không khớp chứng chỉ | Thêm `--url https://localhost:9200` |

## Lưu ý

- Chỉ cần làm lại Bước 3 khi **xóa và tạo lại container** (chứng chỉ mới sẽ được sinh ra). Nếu dùng volume giữ thư mục `config` thì chứng chỉ được giữ nguyên.
- Chứng chỉ chỉ hợp lệ cho các tên/IP: `localhost`, `127.0.0.1`, `::1` và một số IP/tên container. Vì vậy hãy kết nối qua `localhost` khi chạy service từ IntelliJ trên máy host.
- **Không commit** `http_ca.crt` cùng mật khẩu lên Git công khai. Thêm vào `.gitignore` các file `.env` và thư mục `certs/` nếu cần.
- Mật khẩu chỉ nên dùng cho môi trường dev local. Với môi trường thật, hãy đặt mật khẩu mạnh và quản lý bằng secret manager hoặc biến môi trường.

## Phương án thay thế (chỉ dùng khi dev local)

Nếu không muốn dùng SSL, có thể tắt security trong `elasticsearch.yml`:

```yaml
xpack.security.enabled: false
xpack.security.http.ssl.enabled: false
```

Khởi động lại Elasticsearch, rồi sửa `application.yml`:

```yaml
spring:
  elasticsearch:
    uris: http://localhost:9200
```

và xóa các phần `username`, `password`, `restclient.ssl` và `spring.ssl.bundle`. Không dùng cách này cho môi trường thật.