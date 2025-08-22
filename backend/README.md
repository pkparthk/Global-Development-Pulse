# Global Development Pulse - Backend 🚀

A robust Django REST API backend for serving World Bank development indicators with comprehensive caching, authentication, and data management capabilities.

<div align="center">

![Django](https://img.shields.io/badge/Django-3.2+-green)
![Python](https://img.shields.io/badge/Python-3.12+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-green)

</div>

## 🌟 Features

### 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **User Management**: Registration, login, profile management
- **Rate Limiting**: API throttling (100 req/min for authenticated users)
- **CORS Protection**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with DRF serializers

### 📊 Data Management

- **World Bank API Integration**: Real-time data fetching from official sources
- **Multi-layer Caching**: Redis + MongoDB caching for optimal performance
- **Data Aggregation**: Country, indicator, and time-series data processing
- **Error Recovery**: Robust error handling with graceful degradation
- **Background Tasks**: Async data processing capabilities

### ⚡ Performance & Scalability

- **Database Optimization**: Indexed MongoDB collections
- **Query Optimization**: Efficient data retrieval patterns
- **Cache Strategy**: Smart invalidation and warming
- **Connection Pooling**: Optimized database connections
- **Health Monitoring**: Built-in health checks and metrics

## 🛠️ Technology Stack

| Technology                | Version | Purpose                   |
| ------------------------- | ------- | ------------------------- |
| **Django**                | 3.2.25  | Web Framework             |
| **Django REST Framework** | 3.12+   | API Development           |
| **MongoDB**               | 7.0+    | Primary Database          |
| **Djongo**                | 1.3.6   | MongoDB ORM for Django    |
| **Redis**                 | 5.0+    | Caching Layer             |
| **Gunicorn**              | 22.0+   | WSGI HTTP Server          |
| **JWT**                   | 4.8+    | Authentication Tokens     |
| **Requests**              | 2.32+   | HTTP Client Library       |
| **Python Decouple**       | 3.8     | Environment Configuration |

## 🚀 Quick Start

### Prerequisites

- **Python** 3.12 or higher
- **MongoDB** 7.0+ (local or Atlas)
- **Redis** 5.0+ (optional, for caching)
- **Git**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/pkparthk/Global-Development-Pulse.git
   cd Global-Development-Pulse/backend
   ```

2. **Create virtual environment**

   ```bash
   python -m venv .venv

   # Activate virtual environment
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. **Install dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   DJANGO_SECRET_KEY=your-super-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1

   MONGODB_URI=mongodb://localhost:27017
   MONGODB_NAME=global_development_pulse

   REDIS_URL=redis://localhost:6379/0
   CACHE_TTL=3600

   WORLD_BANK_API_BASE=https://api.worldbank.org/v2
   ```

5. **Setup database**

   ```bash
   # Run migrations
   python manage.py migrate

   # Create superuser (optional)
   python manage.py createsuperuser

   # Collect static files
   python manage.py collectstatic --noinput
   ```

6. **Start development server**

   ```bash
   python manage.py runserver
   ```

7. **Access the API**
   - API Root: http://localhost:8000/api/
   - Admin Panel: http://localhost:8000/admin/
   - Health Check: http://localhost:8000/api/health/

## 📁 Project Structure

```
backend/
├── 📁 api/                      # Main Django application
│   ├── 📁 services/            # External service integrations
│   │   └── 📄 worldbank.py     # World Bank API client
│   ├── 📁 migrations/          # Database migrations
│   ├── 📁 tests/               # Test files
│   │   └── 📄 test_auth.py     # Authentication tests
│   ├── 📄 __init__.py
│   ├── 📄 admin.py             # Django admin configuration
│   ├── 📄 apps.py              # App configuration
│   ├── 📄 models.py            # Database models
│   ├── 📄 mongodb.py           # MongoDB utilities
│   ├── 📄 serializers.py       # DRF serializers
│   ├── 📄 urls.py              # URL routing
│   ├── 📄 utils.py             # Utility functions
│   └── 📄 views.py             # API endpoints
├── 📁 project/                 # Django project settings
│   ├── 📄 __init__.py
│   ├── 📄 asgi.py              # ASGI configuration
│   ├── 📄 settings.py          # Django settings
│   ├── 📄 urls.py              # Root URL configuration
│   └── 📄 wsgi.py              # WSGI configuration
├── 📁 scripts/                 # Management scripts
│   └── 📄 list_users.py        # User management utilities
├── 📁 static/                  # Static files
├── 📄 manage.py                # Django management script
├── 📄 requirements.txt         # Python dependencies
├── 📄 render.yaml             # Deployment configuration
├── 📄 runtime.txt             # Python version specification
└── 📄 README.md               # This file
```

## 🗄️ Database Models

### Core Models

#### User Authentication

```python
# Built-in Django User model extended with:
class User(AbstractUser):
    # Standard fields: username, email, first_name, last_name, password
    pass
```

#### Cache Management

```python
class QueryCache(models.Model):
    key = models.CharField(max_length=255, unique=True)
    payload = models.JSONField()
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
```

#### Country Metadata

```python
class Country(models.Model):
    code = models.CharField(max_length=3, unique=True)  # ISO3 code
    name = models.CharField(max_length=255)
    region = models.CharField(max_length=255)
    income_level = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
```

#### Indicator Metadata

```python
class Indicator(models.Model):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=500)
    category = models.CharField(max_length=100)
    description = models.TextField()
    unit = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
```

#### Audit Logging

```python
class AuditLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    action = models.CharField(max_length=100)
    path = models.CharField(max_length=500)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
```

## 📡 API Endpoints

### Authentication Endpoints

#### User Registration

```http
POST /api/auth/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "secure_password",
  "password_confirm": "secure_password"
}
```

**Response:**

```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### User Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "secure_password"
}
```

#### Token Refresh

```http
POST /api/auth/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

#### User Profile

```http
GET /api/auth/profile/
Authorization: Bearer <access_token>
```

### Data Endpoints

#### Get Countries

```http
GET /api/countries/
Authorization: Bearer <access_token>
```

**Response:**

```json
[
  {
    "code": "USA",
    "name": "United States",
    "region": "North America",
    "income_level": "High income"
  },
  {
    "code": "IND",
    "name": "India",
    "region": "East Asia & Pacific",
    "income_level": "Upper middle income"
  }
]
```

#### Get Indicators

```http
GET /api/indicators/
Authorization: Bearer <access_token>
```

**Response:**

```json
[
  {
    "code": "NY.GDP.MKTP.CD",
    "name": "GDP (current US$)",
    "category": "Economic",
    "unit": "US$",
    "is_default": true
  }
]
```

#### Get Time Series Data

```http
GET /api/series/?indicator=NY.GDP.MKTP.CD&countries=USA,CHN&start=2010&end=2020
Authorization: Bearer <access_token>
```

**Query Parameters:**

- `indicator` (required): Indicator code
- `countries` (required): Comma-separated ISO3 country codes
- `start` (optional): Start year (default: 2000)
- `end` (optional): End year (default: current year)
- `per_capita` (optional): Per capita calculation (default: false)

**Response:**

```json
{
  "indicator": "NY.GDP.MKTP.CD",
  "series": [
    {
      "country": "USA",
      "data": [
        { "year": 2010, "value": 14992052000000 },
        { "year": 2011, "value": 15542581000000 }
      ]
    }
  ],
  "source": "World Bank Open Data"
}
```

#### Get Snapshot Data

```http
GET /api/snapshot/?indicator=NY.GDP.MKTP.CD&countries=USA,CHN&year=2020
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "indicator": "NY.GDP.MKTP.CD",
  "year": 2020,
  "values": [
    { "country": "USA", "value": 20953030000000 },
    { "country": "CHN", "value": 14722730000000 }
  ],
  "source": "World Bank Open Data"
}
```

### Health & Monitoring

#### Health Check

```http
GET /api/health/
```

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-08-23T10:30:00Z",
  "services": {
    "database": "connected",
    "cache": "connected",
    "external_api": "available"
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable                     | Description                      | Default                      | Required |
| ---------------------------- | -------------------------------- | ---------------------------- | -------- |
| `DJANGO_SECRET_KEY`          | Django secret key                | -                            | ✅       |
| `DEBUG`                      | Debug mode                       | False                        | ❌       |
| `ALLOWED_HOSTS`              | Allowed hostnames                | localhost                    | ✅       |
| `MONGODB_URI`                | MongoDB connection string        | mongodb://localhost:27017    | ✅       |
| `MONGODB_NAME`               | Database name                    | global_development_pulse     | ✅       |
| `REDIS_URL`                  | Redis connection string          | redis://localhost:6379/0     | ❌       |
| `CACHE_TTL`                  | Cache TTL in seconds             | 3600                         | ❌       |
| `WORLD_BANK_API_BASE`        | World Bank API URL               | https://api.worldbank.org/v2 | ✅       |
| `JWT_ACCESS_TOKEN_LIFETIME`  | Access token lifetime (minutes)  | 60                           | ❌       |
| `JWT_REFRESH_TOKEN_LIFETIME` | Refresh token lifetime (minutes) | 1440                         | ❌       |

### Django Settings

#### Database Configuration

```python
# MongoDB with Djongo
DATABASES = {
    'default': {
        'ENGINE': 'djongo',
        'NAME': config('MONGODB_NAME'),
        'CLIENT': {
            'host': config('MONGODB_URI'),
        }
    }
}
```

#### Cache Configuration

```python
# Redis cache
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': config('REDIS_URL'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

#### CORS Configuration

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000", 
    "https://your-frontend-domain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

#### JWT Configuration

```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}
```

## 🎯 Caching Strategy

### Multi-layer Caching

1. **Redis Cache**: Fast in-memory caching for frequently accessed data
2. **Database Cache**: Persistent caching in MongoDB for data recovery
3. **Application Cache**: Request-level caching for API responses

### Cache Implementation

```python
def get_cached_data(cache_key: str, fetch_func: callable, ttl: int = 3600):
    """Multi-layer cache retrieval"""
    # Try Redis first
    data = cache.get(cache_key)
    if data:
        return data

    # Try database cache
    try:
        cache_entry = QueryCache.objects.get(key=cache_key)
        if not cache_entry.is_expired():
            cache.set(cache_key, cache_entry.payload, ttl)
            return cache_entry.payload
    except QueryCache.DoesNotExist:
        pass

    # Fetch fresh data
    data = fetch_func()

    # Save to both caches
    cache.set(cache_key, data, ttl)
    QueryCache.objects.update_or_create(
        key=cache_key,
        defaults={
            'payload': data,
            'expires_at': timezone.now() + timedelta(seconds=ttl)
        }
    )

    return data
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
python manage.py test

# Run specific test module
python manage.py test api.tests.test_auth

# Run with coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Test Structure

```python
# api/tests/test_auth.py
from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status

class AuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123'
        }

    def test_user_registration(self):
        response = self.client.post('/api/auth/register/', self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)

    def test_user_login(self):
        User.objects.create_user(**self.user_data)
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post('/api/auth/login/', login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
```

### Test Coverage

- **Authentication**: Registration, login, token refresh
- **Data Endpoints**: Country/indicator listing, series/snapshot data
- **Caching**: Cache hit/miss scenarios
- **Error Handling**: Invalid requests, external API failures
- **Security**: Authentication, authorization, input validation


### Production Deployment (Render)

#### 1. Environment Setup

```env
DJANGO_SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app.onrender.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
REDIS_URL=redis://user:pass@redis-host:port
```

#### 2. Build Commands

```bash
# Build command
python -m pip install -r requirements.txt

# Start command
python manage.py migrate --noinput && \
python manage.py collectstatic --noinput && \
gunicorn project.wsgi:application --bind 0.0.0.0:$PORT
```

#### 3. Database Migration

```bash
# Production migration
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (if needed)
python manage.py loaddata fixtures/initial_data.json
```


### Database Management

```bash
# Create migration
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migration status
python manage.py showmigrations

# Database shell
python manage.py dbshell

# Django shell
python manage.py shell
```

## 🔍 Monitoring & Logging

### Logging Configuration

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': 'django_errors.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'api': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### Performance Monitoring

```python
# api/middleware.py
import time
import logging

logger = logging.getLogger(__name__)

class PerformanceMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()

        response = self.get_response(request)

        duration = time.time() - start_time
        logger.info(f"{request.method} {request.path} - {response.status_code} - {duration:.3f}s")

        return response
```

## 🔐 Security Best Practices

### Authentication Security

- **JWT Tokens**: Short-lived access tokens with refresh mechanism
- **Password Hashing**: Django's built-in PBKDF2 password hashing
- **CORS Protection**: Strict origin whitelisting
- **Rate Limiting**: API throttling to prevent abuse

### Input Validation

```python
# serializers.py
class SeriesQuerySerializer(serializers.Serializer):
    indicator = serializers.CharField(max_length=50, required=True)
    countries = serializers.CharField(max_length=1000, required=True)
    start = serializers.IntegerField(min_value=1960, max_value=2030, required=False)
    end = serializers.IntegerField(min_value=1960, max_value=2030, required=False)

    def validate_countries(self, value):
        # Validate country codes format
        codes = [code.strip() for code in value.split(',')]
        if len(codes) > 10:
            raise serializers.ValidationError("Maximum 10 countries allowed")
        return value
```

### Environment Security

```python
# settings.py
import os
from decouple import config

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# HTTPS settings (production)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Setup development environment
4. Make changes and add tests
5. Run tests: `python manage.py test`
6. Check code style: `black . && flake8 .`
7. Commit changes: `git commit -m 'feat: add amazing feature'`
8. Push to branch: `git push origin feature/amazing-feature`
9. Open Pull Request

### Code Standards

- **PEP 8**: Python code style guide
- **Black**: Code formatting
- **Type Hints**: Use type annotations where possible
- **Docstrings**: Document all functions and classes
- **Tests**: Maintain >80% test coverage

### Development Guidelines

```python
# Example: Model with proper documentation
class Country(models.Model):
    """
    Country metadata from World Bank API.

    Stores information about countries including ISO codes,
    names, regions, and income levels.
    """
    code = models.CharField(
        max_length=3,
        unique=True,
        help_text="ISO 3-letter country code"
    )
    name = models.CharField(
        max_length=255,
        help_text="Country name"
    )

    class Meta:
        db_table = 'countries'
        ordering = ['name']
        verbose_name_plural = 'Countries'

    def __str__(self) -> str:
        return f"{self.name} ({self.code})"
```

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check MongoDB connection
python manage.py shell -c "from django.db import connection; connection.ensure_connection()"

# Reset database
python manage.py flush --noinput
python manage.py migrate
```

#### Cache Issues

```bash
# Clear Redis cache
python manage.py shell -c "from django.core.cache import cache; cache.clear()"

# Test Redis connection
redis-cli ping
```

#### Migration Problems

```bash
# Reset migrations
find . -path "*/migrations/*.py" -not -name "__init__.py" -delete
find . -path "*/migrations/*.pyc" -delete
python manage.py makemigrations
python manage.py migrate
```

#### API Rate Limiting

```python
# Check throttle status
from rest_framework.throttling import UserRateThrottle
throttle = UserRateThrottle()
throttle.get_cache_key(request, view)
```


<div align="center">

**Part of Global Development Pulse ecosystem**

[Frontend](../frontend/README.md) • [Main Documentation](../README.md)

</div>
