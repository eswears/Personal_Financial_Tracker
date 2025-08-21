# 🚀 Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Options](#deployment-options)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployments](#cloud-deployments)
7. [Production Checklist](#production-checklist)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Scaling Strategies](#scaling-strategies)
10. [Disaster Recovery](#disaster-recovery)

## Overview

This guide covers deploying Personal Finance Tracker from development to production environments. We support multiple deployment strategies to match your infrastructure needs.

### Deployment Architecture

```mermaid
graph TB
    subgraph "Load Balancing"
        LB[Load Balancer<br/>Nginx/CloudFlare]
    end
    
    subgraph "Application Instances"
        Node1[Node.js<br/>Instance 1<br/>API]
        Node2[Node.js<br/>Instance 2<br/>API]
        Node3[Node.js<br/>Instance N<br/>API]
    end
    
    subgraph "Data Stores"
        PostgreSQL[(PostgreSQL<br/>Supabase)]
        Redis[(Redis<br/>Cache)]
        S3[(S3<br/>File Storage)]
    end
    
    subgraph "Supporting Services"
        Queue[Job Queue<br/>Bull/Redis]
        Monitor[Monitoring<br/>Datadog]
    end
    
    LB --> Node1
    LB --> Node2
    LB --> Node3
    
    Node1 --> PostgreSQL
    Node1 --> Redis
    Node1 --> Queue
    
    Node2 --> PostgreSQL
    Node2 --> Redis
    Node2 --> Queue
    
    Node3 --> PostgreSQL
    Node3 --> Redis
    Node3 --> Queue
    
    Queue --> S3
    
    Node1 -.-> Monitor
    Node2 -.-> Monitor
    Node3 -.-> Monitor
    
    style LB fill:#ff9800
    style PostgreSQL fill:#336791
    style Redis fill:#dc382d
    style Monitor fill:#632ca6
```

## Prerequisites

### System Requirements

| Component | Minimum | Recommended | Production |
|-----------|---------|-------------|------------|
| **CPU** | 2 cores | 4 cores | 8+ cores |
| **RAM** | 2 GB | 4 GB | 8+ GB |
| **Storage** | 10 GB | 20 GB | 50+ GB SSD |
| **Node.js** | 18.x | 20.x LTS | 20.x LTS |
| **PostgreSQL** | 13 | 14 | 15+ |
| **Redis** | 6.0 | 7.0 | 7.0+ |

### Required Services

1. **Database**: PostgreSQL (self-hosted or Supabase)
2. **Cache**: Redis (optional but recommended)
3. **File Storage**: S3-compatible storage (for uploads)
4. **Email Service**: SMTP or SendGrid (for notifications)
5. **Monitoring**: Datadog, New Relic, or similar

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### `.env.production`

```bash
# Application
NODE_ENV=production
APP_NAME=PersonalFinanceTracker
APP_URL=https://financetracker.io
API_URL=https://api.financetracker.io

# Server
PORT=3200
WORKERS=4
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_SSL=true

# Supabase (if using)
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Redis
REDIS_URL=redis://user:password@host:6379/0
REDIS_TTL=3600

# AI Services
CLAUDE_API_KEY=your-claude-api-key
OPENAI_API_KEY=your-openai-api-key

# File Storage
S3_BUCKET=finance-tracker-uploads
S3_REGION=us-east-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Security
JWT_SECRET=your-very-long-random-string
ENCRYPTION_KEY=your-32-character-encryption-key
SESSION_SECRET=your-session-secret
CORS_ORIGINS=https://financetracker.io,https://app.financetracker.io

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@financetracker.io

# Monitoring
SENTRY_DSN=https://key@sentry.io/project
DATADOG_API_KEY=your-datadog-key
NEW_RELIC_LICENSE_KEY=your-newrelic-key

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Feature Flags
ENABLE_AI_INSIGHTS=true
ENABLE_BANK_SYNC=true
ENABLE_PREMIUM_FEATURES=false
```

### SSL/TLS Certificates

#### Using Let's Encrypt (Recommended)

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d financetracker.io -d api.financetracker.io

# Auto-renewal
sudo certbot renew --dry-run
```

#### Using Custom Certificates

```bash
# Place certificates in /etc/ssl/
sudo cp fullchain.pem /etc/ssl/certs/financetracker.pem
sudo cp privkey.pem /etc/ssl/private/financetracker.key

# Set permissions
sudo chmod 644 /etc/ssl/certs/financetracker.pem
sudo chmod 600 /etc/ssl/private/financetracker.key
```

## Deployment Options

### Option 1: Single Server

Best for: Small teams, POC, development

```bash
# Clone repository
git clone https://github.com/yourusername/personal-finance-tracker.git
cd personal-finance-tracker

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Option 2: Docker Containers

Best for: Medium deployments, microservices

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale api=3
```

### Option 3: Kubernetes

Best for: Large scale, enterprise

```bash
# Apply configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

# Scale deployment
kubectl scale deployment finance-tracker --replicas=5
```

### Option 4: Serverless

Best for: Variable traffic, cost optimization

```bash
# Deploy with Serverless Framework
serverless deploy --stage production

# Or with Vercel
vercel --prod
```

## Docker Deployment

### Dockerfile

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY src/frontend/package*.json ./src/frontend/
COPY src/backend/package*.json ./src/backend/

# Install dependencies
RUN npm ci --only=production
RUN cd src/frontend && npm ci --only=production
RUN cd src/backend && npm ci --only=production

# Copy source code
COPY . .

# Build frontend
RUN cd src/frontend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/backend ./src/backend
COPY --from=builder /app/src/frontend/dist ./src/frontend/dist
COPY --from=builder /app/package.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

EXPOSE 3200

CMD ["node", "src/backend/server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3200:3200"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - finance-network

  postgres:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: financetracker
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    networks:
      - finance-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - finance-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - finance-network

volumes:
  postgres_data:
  redis_data:

networks:
  finance-network:
    driver: bridge
```

### Building and Running

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Cloud Deployments

### AWS Deployment

#### Using Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p node.js-20 finance-tracker

# Create environment
eb create production --instance-type t3.medium

# Deploy
eb deploy

# Open application
eb open
```

#### Using ECS

```bash
# Build and push image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_URI
docker build -t finance-tracker .
docker tag finance-tracker:latest $ECR_URI/finance-tracker:latest
docker push $ECR_URI/finance-tracker:latest

# Update ECS service
aws ecs update-service --cluster production --service finance-tracker --force-new-deployment
```

### Google Cloud Platform

```bash
# Configure project
gcloud config set project finance-tracker

# Build and deploy
gcloud builds submit --tag gcr.io/finance-tracker/app
gcloud run deploy --image gcr.io/finance-tracker/app --platform managed

# Or using App Engine
gcloud app deploy app.yaml
```

### Azure Deployment

```bash
# Create resources
az group create --name finance-tracker-rg --location eastus
az appservice plan create --name finance-tracker-plan --resource-group finance-tracker-rg --sku B2

# Deploy
az webapp create --resource-group finance-tracker-rg --plan finance-tracker-plan --name finance-tracker
az webapp deployment source config-local-git --name finance-tracker --resource-group finance-tracker-rg

# Push code
git remote add azure <deployment-url>
git push azure main
```

### Heroku Deployment

```bash
# Create app
heroku create finance-tracker

# Add buildpacks
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=$DATABASE_URL

# Deploy
git push heroku main

# Scale
heroku ps:scale web=2
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment
vercel env add DATABASE_URL production
vercel env add CLAUDE_API_KEY production
```

## Production Checklist

### Pre-deployment

- [ ] **Code Review**: All code reviewed and approved
- [ ] **Testing**: All tests passing (unit, integration, E2E)
- [ ] **Security Scan**: No vulnerabilities in dependencies
- [ ] **Performance**: Load testing completed
- [ ] **Documentation**: API docs and user guides updated
- [ ] **Backup**: Database backup strategy in place
- [ ] **Rollback Plan**: Prepared and tested

### Configuration

- [ ] **Environment Variables**: All production values set
- [ ] **SSL/TLS**: Certificates installed and verified
- [ ] **CORS**: Configured for production domains
- [ ] **Rate Limiting**: Appropriate limits set
- [ ] **Error Handling**: Sentry/error tracking configured
- [ ] **Logging**: Centralized logging setup

### Security

- [ ] **Secrets Management**: Using vault or secret manager
- [ ] **Database Security**: SSL enabled, strong passwords
- [ ] **API Security**: Authentication required
- [ ] **Input Validation**: All inputs sanitized
- [ ] **XSS Protection**: CSP headers configured
- [ ] **SQL Injection**: Parameterized queries only
- [ ] **File Upload**: Size and type restrictions

### Performance

- [ ] **CDN**: Static assets served via CDN
- [ ] **Caching**: Redis configured and tested
- [ ] **Compression**: Gzip/Brotli enabled
- [ ] **Database Indexes**: Optimized for queries
- [ ] **Connection Pooling**: Database pools configured
- [ ] **Image Optimization**: All images compressed

### Monitoring

- [ ] **Uptime Monitoring**: StatusPage or equivalent
- [ ] **APM**: Application Performance Monitoring
- [ ] **Error Tracking**: Sentry integration
- [ ] **Metrics**: Prometheus/Grafana setup
- [ ] **Alerting**: PagerDuty or equivalent
- [ ] **Log Aggregation**: ELK stack or similar

## Monitoring & Maintenance

### Health Checks

```javascript
// healthcheck.js
const http = require('http');

const options = {
  host: 'localhost',
  port: 3200,
  path: '/health',
  timeout: 2000
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode == 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err);
  process.exit(1);
});

request.end();
```

### Monitoring Setup

#### Datadog

```yaml
# datadog-agent.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: datadog-agent
data:
  DD_API_KEY: your-api-key
  DD_SITE: datadoghq.com
  DD_APM_ENABLED: "true"
  DD_LOGS_ENABLED: "true"
```

#### Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'finance-tracker'
    static_configs:
      - targets: ['localhost:3200']
    metrics_path: '/metrics'
```

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://finance-tracker-backups/

# Clean old backups (keep 30 days)
find . -name "backup_*.sql" -mtime +30 -delete
```

### Update Process

```bash
# 1. Backup current version
kubectl create backup finance-tracker-$(date +%Y%m%d)

# 2. Deploy to staging
kubectl apply -f k8s/staging/

# 3. Run tests
npm run test:staging

# 4. Blue-green deployment
kubectl set image deployment/finance-tracker app=finance-tracker:v2.0.0

# 5. Verify
kubectl rollout status deployment/finance-tracker

# 6. Rollback if needed
kubectl rollout undo deployment/finance-tracker
```

## Scaling Strategies

### Horizontal Scaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: finance-tracker-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: finance-tracker
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

```sql
-- Read replicas
CREATE PUBLICATION finance_pub FOR ALL TABLES;

-- On replica
CREATE SUBSCRIPTION finance_sub
CONNECTION 'host=primary dbname=finance'
PUBLICATION finance_pub;
```

### Caching Strategy

```javascript
// Redis caching layer
const cache = {
  async get(key) {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  },
  
  async set(key, value, ttl = 3600) {
    await redis.setex(
      key,
      ttl,
      JSON.stringify(value)
    );
  },
  
  async invalidate(pattern) {
    const keys = await redis.keys(pattern);
    if (keys.length) {
      await redis.del(keys);
    }
  }
};
```

## Disaster Recovery

### Backup and Restore

```bash
#!/bin/bash
# disaster-recovery.sh

# Full backup
pg_dumpall -h $DB_HOST -U $DB_USER > full_backup.sql
tar -czf app_backup.tar.gz /app
aws s3 sync . s3://disaster-recovery/$(date +%Y%m%d)/

# Restore
aws s3 sync s3://disaster-recovery/20240115/ .
psql -h $DB_HOST -U $DB_USER < full_backup.sql
tar -xzf app_backup.tar.gz -C /
```

### Failover Strategy

```yaml
# k8s/failover.yaml
apiVersion: v1
kind: Service
metadata:
  name: finance-tracker-failover
spec:
  type: LoadBalancer
  selector:
    app: finance-tracker
    tier: standby
  ports:
    - port: 80
      targetPort: 3200
```

### Recovery Time Objectives

| Scenario | RTO | RPO | Strategy |
|----------|-----|-----|----------|
| Application Crash | < 1 min | 0 | Auto-restart |
| Database Failure | < 5 min | < 1 min | Hot standby |
| Region Outage | < 30 min | < 5 min | Multi-region |
| Complete Loss | < 4 hours | < 1 hour | Full restore |

## Troubleshooting

### Common Issues

#### High Memory Usage

```bash
# Check memory usage
docker stats

# Increase Node memory limit
NODE_OPTIONS="--max-old-space-size=4096" node server.js

# Or in Dockerfile
ENV NODE_OPTIONS="--max-old-space-size=4096"
```

#### Database Connection Issues

```javascript
// Add connection retry logic
const connectWithRetry = async () => {
  for (let i = 0; i < 5; i++) {
    try {
      await database.connect();
      console.log('Database connected');
      return;
    } catch (err) {
      console.log(`Connection attempt ${i + 1} failed`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  throw new Error('Database connection failed');
};
```

#### SSL Certificate Issues

```bash
# Verify certificate
openssl s_client -connect financetracker.io:443 -servername financetracker.io

# Check expiration
echo | openssl s_client -connect financetracker.io:443 2>/dev/null | openssl x509 -noout -dates
```

### Performance Optimization

```bash
# Enable Node.js clustering
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  require('./server');
}
```

## Security Hardening

### Network Security

```bash
# Firewall rules
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Fail2ban configuration
apt-get install fail2ban
systemctl enable fail2ban
```

### Application Security

```javascript
// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Support

For deployment assistance:
- Documentation: https://docs.financetracker.io/deployment
- Community: https://forum.financetracker.io/deployment
- Email: devops@financetracker.io

---

*Deployment Guide v1.0.0 | Last Updated: January 2025*