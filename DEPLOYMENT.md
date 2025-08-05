# Deployment Guide

This document provides comprehensive instructions for deploying the Web Scraping UI frontend application.

## Table of Contents

- [Environment Configuration](#environment-configuration)
- [Build Process](#build-process)
- [Docker Deployment](#docker-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [CDN and Asset Optimization](#cdn-and-asset-optimization)
- [Monitoring and Health Checks](#monitoring-and-health-checks)
- [Troubleshooting](#troubleshooting)

## Environment Configuration

### Environment Variables

The application uses environment variables for configuration. Create appropriate `.env` files for each environment:

#### Development (`.env.development`)
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_TITLE=Web Scraping Dashboard (Dev)
VITE_APP_DESCRIPTION=Development environment for web scraping management
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

#### Staging (`.env.staging`)
```bash
VITE_API_BASE_URL=https://staging-api.yourdomain.com
VITE_APP_TITLE=Web Scraping Dashboard (Staging)
VITE_APP_DESCRIPTION=Staging environment for web scraping management
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=warn
```

#### Production (`.env.production`)
```bash
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_TITLE=Web Scraping Dashboard
VITE_APP_DESCRIPTION=Professional web scraping management interface
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
```

### Optional CDN Configuration

For production deployments with CDN support:

```bash
VITE_CDN_URL=https://cdn.yourdomain.com
VITE_ASSETS_URL=https://assets.yourdomain.com
```

## Build Process

### Local Development Build

```bash
# Install dependencies
npm ci

# Development build
npm run build

# Staging build
npm run build:staging

# Production build
npm run build:production
```

### Build Verification

After building, verify the output:

```bash
# Check build output
npm run build:check

# Preview the build
npm run preview
```

### Build Scripts

| Script | Description |
|--------|-------------|
| `build` | Standard development build |
| `build:staging` | Staging environment build |
| `build:production` | Production optimized build |
| `build:analyze` | Build with bundle analysis |
| `build:check` | Verify build output |

## Docker Deployment

### Building Docker Image

```bash
# Basic build
docker build -t web-scraping-ui .

# Production build with environment variables
docker build -t web-scraping-ui:prod \
  --build-arg VITE_API_BASE_URL=https://api.yourdomain.com \
  --build-arg VITE_APP_TITLE="Web Scraping Dashboard" \
  --build-arg VITE_ENABLE_DEVTOOLS=false \
  --build-arg VITE_LOG_LEVEL=error \
  .
```

### Running Docker Container

```bash
# Run container
docker run -p 3000:80 web-scraping-ui

# Run with custom configuration
docker run -p 3000:80 \
  -e VITE_API_BASE_URL=https://api.yourdomain.com \
  web-scraping-ui
```

### Docker Compose

The application is included in the main `docker-compose.yml`:

```bash
# Start all services including frontend
docker-compose up -d

# Start only frontend
docker-compose up frontend
```

## CI/CD Pipeline

### GitHub Actions

The project includes two GitHub Actions workflows:

#### CI Workflow (`.github/workflows/ci.yml`)

Runs on every push and pull request:
- Type checking
- Linting
- Testing
- Building
- Docker image creation

#### Deployment Workflow (`.github/workflows/deploy.yml`)

Handles deployments to staging and production:
- Automated staging deployment on main branch
- Manual production deployment via workflow dispatch

### Setting Up CI/CD

1. **Configure Secrets:**
   ```
   DOCKER_USERNAME - Docker Hub username
   DOCKER_PASSWORD - Docker Hub password
   STAGING_API_URL - Staging API endpoint
   PRODUCTION_API_URL - Production API endpoint
   SLACK_WEBHOOK - Slack notification webhook (optional)
   ```

2. **Configure Environments:**
   - Create `staging` and `production` environments in GitHub
   - Set environment-specific variables and protection rules

3. **Deploy:**
   ```bash
   # Automatic staging deployment (on main branch push)
   git push origin main
   
   # Manual production deployment
   # Use GitHub Actions UI to trigger deploy workflow
   ```

## CDN and Asset Optimization

### Static Asset Optimization

The build process automatically optimizes assets:

- **JavaScript**: Minification, tree shaking, code splitting
- **CSS**: Minification, purging unused styles
- **Images**: Compression and format optimization
- **Fonts**: Preloading and optimization

### CDN Configuration

For CDN deployment:

1. **Upload build artifacts** to your CDN
2. **Configure environment variables**:
   ```bash
   VITE_CDN_URL=https://cdn.yourdomain.com
   VITE_ASSETS_URL=https://assets.yourdomain.com
   ```
3. **Set up cache invalidation** in your deployment pipeline

### Service Worker

The application includes a service worker for caching:

- Caches static assets for offline access
- Implements cache-first strategy for assets
- Network-first strategy for API calls

## Monitoring and Health Checks

### Health Check Endpoint

The Nginx configuration includes a health check endpoint:

```
GET /health
```

Returns `200 OK` with "healthy" response.

### Docker Health Checks

The Docker container includes built-in health checks:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/ || exit 1
```

### Performance Monitoring

The application includes performance monitoring:

- Core Web Vitals tracking
- Bundle size monitoring
- API response time tracking
- Error tracking and reporting

## Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache and reinstall
npm run clean
npm ci
npm run build
```

#### Environment Variable Issues

```bash
# Verify environment variables are loaded
npm run build -- --debug
```

#### Docker Build Issues

```bash
# Build with verbose output
docker build --progress=plain -t web-scraping-ui .

# Check build args
docker build --build-arg VITE_API_BASE_URL=http://localhost:8000 -t web-scraping-ui .
```

#### Performance Issues

```bash
# Analyze bundle size
npm run build:analyze

# Check build output
npm run build:check
```

### Debugging

#### Development Mode

```bash
# Start with debug logging
VITE_LOG_LEVEL=debug npm run dev
```

#### Production Debugging

```bash
# Build with source maps
npm run build -- --sourcemap

# Enable devtools in production (temporarily)
VITE_ENABLE_DEVTOOLS=true npm run build:production
```

### Support

For deployment issues:

1. Check the build logs for errors
2. Verify environment variables are set correctly
3. Test the API connectivity from the deployment environment
4. Check Docker container logs: `docker logs scraper_frontend`
5. Verify health check endpoints are responding

## Security Considerations

### Production Checklist

- [ ] Source maps disabled in production
- [ ] Debug logging disabled
- [ ] HTTPS enforced
- [ ] Security headers configured in Nginx
- [ ] Environment variables properly secured
- [ ] CDN CORS configured correctly
- [ ] Service worker caching policies reviewed

### Nginx Security Headers

The included `nginx.conf` sets security headers:

- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`
- `Content-Security-Policy: default-src 'self'...`

## Performance Optimization

### Bundle Optimization

- Code splitting by route and vendor
- Tree shaking for unused code
- Minification and compression
- Asset optimization and caching

### Runtime Optimization

- Virtual scrolling for large lists
- Lazy loading of images and components
- Service worker caching
- CDN asset delivery

### Monitoring

- Bundle size tracking
- Core Web Vitals monitoring
- Performance profiling in development
- Error boundary implementation