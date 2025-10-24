# SCAP Deployment Guide

## Local Development (Current)

### Prerequisites Installed
- ✅ Python 3.11+
- ✅ MongoDB 7.0+
- ✅ Node.js 18+ (for frontend)

### Running Locally
```cmd
# Backend
cd backend
venv\Scripts\activate
python main.py

# Frontend (when ready)
cd frontend
npm run dev
```

## Production Deployment Checklist

### Phase 1: Backend Deployment

#### 1. Environment Setup
- [ ] Create production `.env` file
- [ ] Generate secure JWT_SECRET_KEY
- [ ] Setup MongoDB Atlas cluster
- [ ] Configure production API keys
- [ ] Setup cloud storage (AWS S3/DigitalOcean Spaces)

#### 2. Code Preparation
- [ ] Remove debug logging
- [ ] Set DEBUG=False
- [ ] Update CORS origins
- [ ] Add rate limiting
- [ ] Enable HTTPS only
- [ ] Add request validation
- [ ] Setup error monitoring (Sentry)

#### 3. Database Migration
- [ ] Export local MongoDB data
- [ ] Import to MongoDB Atlas
- [ ] Create database backups
- [ ] Setup automated backups
- [ ] Configure replica sets
- [ ] Create read replicas

#### 4. Docker Setup
```dockerfile
# Dockerfile for backend
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY .env .

# Download EasyOCR models
RUN python -c "import easyocr; easyocr.Reader(['en', 'ta', 'hi'], gpu=False)"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 5. Cloud Deployment Options

**Option A: DigitalOcean App Platform**
```yaml
# .do/app.yaml
name: scap-backend
services:
  - name: api
    github:
      repo: your-org/scap
      branch: main
      deploy_on_push: true
    build_command: pip install -r backend/requirements.txt
    run_command: cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
    envs:
      - key: MONGODB_URI
        value: ${MONGODB_URI}
      - key: GOOGLE_AI_API_KEY
        value: ${GOOGLE_AI_API_KEY}
    health_check:
      http_path: /health
```

**Option B: AWS Elastic Beanstalk**
```python
# .ebextensions/python.config
option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: backend.main:app
```

**Option C: Heroku**
```
# Procfile
web: cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT
```

#### 6. CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: pytest backend/tests/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to DigitalOcean
        run: |
          # Deploy commands here
```

### Phase 2: Frontend Deployment

#### 1. Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

#### 2. Environment Variables
```env
# .env.production
NEXT_PUBLIC_API_URL=https://api.scaptextile.com
NEXT_PUBLIC_ENVIRONMENT=production
```

#### 3. Build Optimization
- [ ] Enable Next.js image optimization
- [ ] Setup CDN for static assets
- [ ] Enable compression
- [ ] Minify JavaScript/CSS
- [ ] Setup caching headers

### Phase 3: Infrastructure

#### 1. Domain Setup
- [ ] Purchase domain (scaptextile.com)
- [ ] Configure DNS records
  - A record: api.scaptextile.com → Backend IP
  - CNAME: www.scaptextile.com → Vercel
- [ ] Setup SSL certificates (Let's Encrypt)

#### 2. Monitoring
- [ ] Setup Sentry for error tracking
- [ ] Configure Datadog/New Relic for APM
- [ ] Setup uptime monitoring (UptimeRobot)
- [ ] Configure log aggregation (Papertrail)
- [ ] Setup alerts (PagerDuty/Slack)

#### 3. Security
- [ ] Enable HTTPS only
- [ ] Configure firewall rules
- [ ] Setup DDoS protection (Cloudflare)
- [ ] Enable rate limiting
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning

#### 4. Backup Strategy
- [ ] Daily MongoDB backups
- [ ] Weekly full system backups
- [ ] Backup retention policy (30 days)
- [ ] Test restore procedures
- [ ] Document recovery process

### Phase 4: Scaling

#### 1. Database Scaling
- [ ] MongoDB sharding
- [ ] Read replicas
- [ ] Connection pooling
- [ ] Query optimization
- [ ] Index optimization

#### 2. Application Scaling
- [ ] Horizontal scaling (multiple instances)
- [ ] Load balancer setup
- [ ] Auto-scaling rules
- [ ] Caching layer (Redis)
- [ ] CDN for static assets

#### 3. AI Service Optimization
- [ ] Batch processing for OCR
- [ ] Response caching
- [ ] Rate limit handling
- [ ] Fallback models
- [ ] Cost monitoring

## Cost Estimation (Monthly)

### Startup Phase (0-100 suppliers)
| Service | Cost |
|---------|------|
| DigitalOcean Droplet (2GB) | $12 |
| MongoDB Atlas (M10) | $57 |
| Vercel Pro | $20 |
| Domain + SSL | $2 |
| Google AI API (Gemini) | $10 |
| Groq API (Qwen) | $0 (free tier) |
| **Total** | **~$100/month** |

### Growth Phase (100-1000 suppliers)
| Service | Cost |
|---------|------|
| DigitalOcean (4GB + Load Balancer) | $50 |
| MongoDB Atlas (M30) | $250 |
| Vercel Pro | $20 |
| Cloudflare Pro | $20 |
| Google AI API | $50 |
| Groq API | $50 |
| Monitoring (Sentry) | $26 |
| **Total** | **~$466/month** |

### Scale Phase (1000+ suppliers)
| Service | Cost |
|---------|------|
| AWS/DigitalOcean | $200-500 |
| MongoDB Atlas (M60) | $1,000 |
| Vercel Enterprise | $150 |
| Cloudflare Business | $200 |
| AI APIs | $200-500 |
| Monitoring & Tools | $100 |
| **Total** | **~$2,000-2,500/month** |

## Performance Targets

### Production SLAs
- **Uptime**: 99.9% (8.76 hours downtime/year)
- **API Response Time**: <500ms (p95)
- **Certificate Processing**: <5s
- **Chatbot Response**: <2s
- **Page Load Time**: <3s

### Monitoring Metrics
- Request rate (req/sec)
- Error rate (%)
- Response time (ms)
- Database query time (ms)
- AI API latency (ms)
- Memory usage (%)
- CPU usage (%)
- Disk usage (%)

## Rollback Plan

### If Deployment Fails
1. Revert to previous Docker image
2. Restore database from backup
3. Update DNS to old server
4. Notify users of maintenance
5. Debug in staging environment
6. Re-deploy when fixed

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." --archive=backup.archive
```

## Post-Deployment Checklist

- [ ] Verify all API endpoints working
- [ ] Test certificate upload
- [ ] Test chatbot responses
- [ ] Check database connections
- [ ] Verify authentication flow
- [ ] Test multilingual support
- [ ] Check error logging
- [ ] Verify monitoring alerts
- [ ] Test backup restoration
- [ ] Load testing (100+ concurrent users)
- [ ] Security scan (OWASP)
- [ ] Performance profiling

## Maintenance Schedule

### Daily
- Monitor error logs
- Check API response times
- Verify backup completion

### Weekly
- Review performance metrics
- Update dependencies
- Security patches

### Monthly
- Database optimization
- Cost analysis
- User feedback review
- Feature planning

## Support & Troubleshooting

### Common Issues

**High API Latency**
- Check database query performance
- Review AI API response times
- Check network latency
- Scale horizontally if needed

**Database Connection Errors**
- Verify MongoDB Atlas whitelist
- Check connection string
- Review connection pool settings
- Monitor active connections

**AI API Rate Limits**
- Implement request queuing
- Add caching layer
- Use fallback models
- Upgrade API tier

**Memory Issues**
- Profile memory usage
- Check for memory leaks
- Optimize image processing
- Increase instance size

## Documentation

- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture diagrams
- [ ] Database schema
- [ ] Deployment runbook
- [ ] Incident response plan
- [ ] User guides
- [ ] Admin guides

## Compliance & Legal

- [ ] GDPR compliance (EU users)
- [ ] Data retention policy
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Cookie policy
- [ ] Data processing agreement
- [ ] Security audit

---

**Ready for Production**: ❌ Not Yet
**Estimated Time to Production**: 2-4 weeks
**Blockers**: Frontend development, testing, security audit
