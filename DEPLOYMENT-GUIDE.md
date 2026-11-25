
# Shop Meal - Docker Deployment

## 1. Requirements

- Docker
- Docker Compose
- Minimum 8GB RAM recommended
- Available ports: 80, 3306, 27017, 6379, 8761, 8888, 9000, 9001, 9200, 29092

## 2. Project Architecture

The Shop Meal system consists of:

### Backend Microservices

- API Gateway
- Discovery Service
- Identity Service
- Profile Service
- Product Service
- File Service
- Cart Service
- Order Service
- Notification Service
- Search Service
- Payment Service
- Post Service

### Frontend

- React
- TypeScript
- Vite
- Material UI
- Nginx

### Infrastructure

- MySQL
- MongoDB
- Redis
- Apache Kafka
- Elasticsearch
- MinIO

## 3. Environment Configuration

Copy the environment file:

```bash
cp .env.example .env
```

Update the environment variables in `.env`.

Configure Google OAuth, Brevo and PayOS credentials if these integrations are required.

## 4. Build and Start

Validate Docker Compose:

```bash
docker compose config
```

Build all images and start containers:

```bash
docker compose up -d --build
```

## 5. Check Services

```bash
docker compose ps
```

View all logs:

```bash
docker compose logs -f
```

View API Gateway logs:

```bash
docker compose logs -f api-gateway
```

## 6. Access Application

| Component | URL |
|---|---|
| Frontend | http://localhost |
| API Gateway | http://localhost:8888 |
| Eureka | http://localhost:8761 |
| Elasticsearch | http://localhost:9200 |
| MinIO API | http://localhost:9000 |
| MinIO Console | http://localhost:9001 |

## 7. Docker Management

Stop containers:

```bash
docker compose down
```

Restart containers:

```bash
docker compose restart
```

Rebuild one service:

```bash
docker compose up -d --build product-service
```

Remove containers and volumes:

```bash
docker compose down -v
```

WARNING: The last command permanently deletes persistent database and storage data.

## 8. Notes

- MySQL initialization scripts only run when the data directory is empty.
- Google OAuth requires valid credentials.
- Brevo requires a valid API key.
- PayOS requires valid client ID, API key and checksum key.
- Default passwords are for development only.
- Configure secure credentials before production deployment.
