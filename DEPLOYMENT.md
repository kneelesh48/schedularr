# Schedularr - Production Operations Guide

> For basic setup instructions, see the main [README.md](README.md). This guide covers production operations, scaling, and maintenance.

## 🏗️ Docker Architecture

Schedularr uses a microservices architecture with separate containers:

- **db**: PostgreSQL database with health checks
- **redis**: Redis cache and message broker with persistence  
- **worker**: Celery worker processes (horizontally scalable)
- **beat**: Celery beat scheduler (single instance)
- **web**: Django application with Gunicorn WSGI server
- **nginx**: Reverse proxy and static file server

## 📊 Production Scaling

### Horizontal Scaling
```bash
# Scale workers based on load
docker-compose up -d --scale worker=5

# Scale web servers for high traffic
docker-compose up -d --scale web=3
```

## 🔧 Service Management
```bash
# Restart specific services
docker-compose restart worker
docker-compose restart web

# View logs for specific services
docker-compose logs -f worker
docker-compose logs -f web
```

## 🏥 Health Monitoring
All services include health checks:
- **web**: HTTP endpoint check
- **worker**: Celery ping check  
- **beat**: Celery ping check
- **db**: PostgreSQL ready check
- **redis**: Redis ping check
- **nginx**: HTTP health endpoint

## ⚙️ Production Configuration

### Environment Variables

See `backend/.env.example` for all required environment variables.

**Critical production variables:**
- `SECRET_KEY`: Django secret key (generate new for production)
- `DEBUG`: Must be `False` for production
- `POSTGRES_PASSWORD`: Secure database password  
- `REDDIT_CLIENT_ID` & `REDDIT_CLIENT_SECRET`: Reddit API credentials
- `FRONTEND_URL`: Your production domain URL

### SSL/HTTPS Configuration

SSL termination is handled by your hosting provider (e.g., Cloudflare, AWS ALB, etc.). The containers run on HTTP internally.

## 💾 Data Management

### Data Persistence

- `postgres_data`: Database files
- `redis_data`: Redis persistence

### Port Configuration

**Development:**
- PostgreSQL: `5432`
- Redis: `6379`  
- Frontend dev server: `5173`
- Backend dev server: `8000`

**Production:**
- Nginx: `8080` (map to your domain)
- Internal services communicate via Docker networks

## 🔧 Maintenance Operations

### Database Backup & Restore
```bash
# Database backup
docker-compose exec db pg_dump -U reddit_user schedularr > backup.sql

# Restore database
docker-compose exec -T db psql -U reddit_user schedularr < backup.sql
```

### Application Updates
```bash
# Pull latest changes
git pull

# Rebuild and restart services
docker-compose build
docker-compose up -d

# Apply any new migrations
docker-compose exec web uv run python manage.py migrate
```
