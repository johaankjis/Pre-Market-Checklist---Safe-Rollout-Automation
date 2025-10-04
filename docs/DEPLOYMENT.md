# Deployment Guide

This guide covers deployment options and configurations for the Pre-Market Checklist & Safe Rollout Automation platform.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Deployment Options](#deployment-options)
4. [Production Checklist](#production-checklist)
5. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or pnpm 8.x+)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 1GB disk space

### Dependencies

```bash
# Install dependencies
npm install --legacy-peer-deps
# or
pnpm install
```

---

## Environment Configuration

### Environment Variables

Create a `.env.local` file in the root directory for local development:

```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_CANARY=true
NEXT_PUBLIC_ENABLE_CI=true

# External Services (future)
# DATABASE_URL=postgresql://...
# REDIS_URL=redis://...
# SENTRY_DSN=...
```

### Production Environment Variables

For production deployments, set these in your hosting platform:

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com

# Security
SESSION_SECRET=your-secure-random-string-here
JWT_SECRET=your-jwt-secret-here

# Monitoring (optional)
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
SENTRY_DSN=your-sentry-dsn

# External APIs (if connecting to real systems)
NYSE_API_URL=https://api.nyse.com
NASDAQ_API_URL=https://api.nasdaq.com
NYSE_API_KEY=your-api-key
NASDAQ_API_KEY=your-api-key
```

### Environment-Specific Configs

Create separate environment files:

- `.env.development` - Development settings
- `.env.staging` - Staging settings
- `.env.production` - Production settings
- `.env.test` - Test settings

---

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the recommended platform for Next.js applications.

#### Setup

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
# For preview deployment
vercel

# For production deployment
vercel --prod
```

#### Configuration

Create `vercel.json` in the root directory:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "framework": "nextjs",
  "env": {
    "NODE_ENV": "production"
  },
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

#### GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure automatic deployments:
   - Production: `main` branch
   - Preview: Pull requests and other branches
3. Set environment variables in Vercel dashboard

---

### Option 2: Docker

Deploy using Docker containers.

#### Dockerfile

Create `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Build and Run

```bash
# Build image
docker build -t pre-market-checklist .

# Run container
docker run -p 3000:3000 pre-market-checklist

# Or use docker-compose
docker-compose up -d
```

---

### Option 3: Traditional Hosting

Deploy to any Node.js hosting platform.

#### Build for Production

```bash
npm run build
```

This creates an optimized production build in `.next/` directory.

#### Start Production Server

```bash
npm start
```

The server will start on port 3000 by default.

#### Process Management

Use PM2 for process management:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "pre-market-checklist" -- start

# View logs
pm2 logs pre-market-checklist

# Monitor
pm2 monit

# Restart
pm2 restart pre-market-checklist

# Save configuration
pm2 save
pm2 startup
```

#### Nginx Configuration

Use Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### Option 4: Kubernetes

Deploy to Kubernetes cluster.

#### Kubernetes Deployment

Create `k8s/deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pre-market-checklist
spec:
  replicas: 3
  selector:
    matchLabels:
      app: pre-market-checklist
  template:
    metadata:
      labels:
        app: pre-market-checklist
    spec:
      containers:
      - name: app
        image: your-registry/pre-market-checklist:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service Configuration

Create `k8s/service.yaml`:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: pre-market-checklist
spec:
  selector:
    app: pre-market-checklist
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### Deploy

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

## Production Checklist

Before deploying to production:

### Security

- [ ] Enable HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Configure CORS policies
- [ ] Enable rate limiting
- [ ] Add authentication/authorization
- [ ] Set up security headers
- [ ] Enable CSP (Content Security Policy)
- [ ] Implement input validation
- [ ] Set up API key rotation

### Performance

- [ ] Enable caching strategies
- [ ] Configure CDN for static assets
- [ ] Optimize images
- [ ] Enable compression (gzip/brotli)
- [ ] Set up database connection pooling
- [ ] Configure Redis for sessions (if applicable)
- [ ] Enable Next.js Image Optimization

### Monitoring

- [ ] Set up error tracking (Sentry, Rollbar)
- [ ] Configure application monitoring (New Relic, DataDog)
- [ ] Enable analytics (Vercel Analytics, Google Analytics)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Set up alerting for critical errors
- [ ] Monitor API response times

### Reliability

- [ ] Configure automatic backups
- [ ] Set up health checks
- [ ] Configure auto-scaling
- [ ] Implement graceful shutdown
- [ ] Set up load balancing
- [ ] Configure circuit breakers
- [ ] Plan disaster recovery

### Documentation

- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Create runbooks for common issues
- [ ] Document rollback procedures
- [ ] Create incident response plan

---

## Build Optimization

### Next.js Configuration

Update `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Optimize production build
  productionBrowserSourceMaps: false,
  
  // Compress output
  compress: true,
  
  // Output standalone for Docker
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
```

### Bundle Analysis

Analyze bundle size:

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Analyze
ANALYZE=true npm run build
```

---

## Monitoring and Maintenance

### Health Checks

Create a health check endpoint:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
}
```

### Logging

Implement structured logging:

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta }))
  },
  error: (message: string, error?: Error, meta?: object) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      ...meta
    }))
  },
}
```

### Performance Monitoring

Monitor key metrics:

- Response times
- Error rates
- CPU usage
- Memory usage
- Database query times
- API latency

### Backup Strategy

1. **Database Backups**: Daily automated backups
2. **Configuration Backups**: Version control in Git
3. **User Data**: Regular exports
4. **Disaster Recovery**: Tested restore procedures

### Update Strategy

1. **Minor Updates**: Weekly maintenance window
2. **Security Patches**: Apply immediately
3. **Major Updates**: Staged rollout with canary deployment
4. **Rollback Plan**: Keep previous version ready

---

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Port Already in Use**
```bash
# Use different port
PORT=3001 npm start
```

**Memory Issues**
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm run dev
```

---

## Rollback Procedures

If deployment fails:

1. **Vercel**: Revert to previous deployment in dashboard
2. **Docker**: Roll back to previous image tag
3. **Kubernetes**: `kubectl rollout undo deployment/pre-market-checklist`
4. **Traditional**: Restore from backup and restart

---

## Support

For deployment issues:

1. Check logs for error messages
2. Verify environment variables
3. Test locally with production build
4. Review monitoring dashboards
5. Contact DevOps team

---

For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [README.md](../README.md).
