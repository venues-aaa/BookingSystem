# Hall Booking System - Deployment Guide

Complete guide to deploy your Hall Booking System to the internet.

---

## 🚀 Deployment Options Overview

### Backend Options
1. **Railway** - Easiest, free tier available
2. **Render** - Free tier, auto-deploy from GitHub
3. **Heroku** - Simple, free tier (limited hours)
4. **AWS Elastic Beanstalk** - Enterprise, paid
5. **DigitalOcean App Platform** - Simple, paid

### Frontend Options
1. **Vercel** - Best for React, free tier
2. **Netlify** - Great for React, free tier
3. **GitHub Pages** - Free, simple
4. **AWS S3 + CloudFront** - Enterprise, paid
5. **Firebase Hosting** - Google, free tier

### Database Options for Production
1. **PostgreSQL on Railway** - Free tier
2. **PostgreSQL on Render** - Free tier
3. **AWS RDS** - Paid, scalable
4. **ElephantSQL** - Free tier available

---

## 📋 Pre-Deployment Checklist

### 1. Switch from H2 to PostgreSQL

**Update `pom.xml`:**
```xml
<!-- Remove or comment out H2 -->
<!-- <dependency>
    <groupId>com.h2database</groupId>
    <artifactId>h2</artifactId>
    <scope>runtime</scope>
</dependency> -->

<!-- Add PostgreSQL -->
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

**Update `application.properties`:**
```properties
# Production Database (use environment variables)
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update

# Security
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Server
server.port=${PORT:8080}

# CORS - Update with your frontend URL
allowed.origins=${FRONTEND_URL:http://localhost:3000}
```

**Update `SecurityConfig.java`:**
```java
@Value("${allowed.origins}")
private String allowedOrigins;

@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 2. Create Production Configuration

Create `application-prod.properties`:
```properties
spring.jpa.show-sql=false
logging.level.com.hallbooking=INFO
logging.level.org.springframework.security=WARN
```

---

## 🌐 Option 1: Deploy to Railway (Recommended - Easiest)

### Backend Deployment

**Step 1: Prepare Your Project**
```bash
# Create a git repository if not already done
git init
git add .
git commit -m "Initial commit"
```

**Step 2: Create Railway Account**
1. Go to https://railway.app
2. Sign up with GitHub

**Step 3: Deploy Backend**
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Railway auto-detects Spring Boot
5. Add PostgreSQL database:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway automatically creates DATABASE_URL

**Step 4: Set Environment Variables**
In Railway project settings → Variables:
```
JWT_SECRET=your-super-secret-256-bit-key-change-this-now
FRONTEND_URL=https://your-app.vercel.app
DATABASE_URL=postgresql://... (auto-created by Railway)
```

**Step 5: Get Backend URL**
- Railway provides URL like: `https://your-app.railway.app`

### Frontend Deployment to Vercel

**Step 1: Update Frontend API URL**

Edit `hall-booking-frontend/src/services/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.railway.app/api';
```

Or create `.env.production`:
```
REACT_APP_API_URL=https://your-backend.railway.app/api
```

**Step 2: Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend folder
cd hall-booking-frontend

# Deploy
vercel

# Follow prompts:
# - Link to existing project? N
# - Project name: hall-booking-frontend
# - Directory: ./
# - Override settings? N

# For production deployment
vercel --prod
```

**Alternative: Deploy via Vercel Dashboard**
1. Go to https://vercel.com
2. Import Git Repository
3. Select `hall-booking-frontend` folder
4. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend.railway.app/api`
5. Click Deploy

---

## 🎯 Option 2: Deploy to Render

### Backend on Render

**Step 1: Create Render Account**
- Go to https://render.com
- Sign up with GitHub

**Step 2: Create PostgreSQL Database**
1. Dashboard → New → PostgreSQL
2. Name: `hallbooking-db`
3. Free tier
4. Copy the "Internal Database URL"

**Step 3: Create Web Service**
1. Dashboard → New → Web Service
2. Connect GitHub repository
3. Configure:
   - **Name**: `hall-booking-backend`
   - **Environment**: `Java`
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/hall-booking-system-1.0.0.jar`
   - **Plan**: Free

**Step 4: Environment Variables**
```
DATABASE_URL=<from step 2>
JWT_SECRET=your-secret-key
FRONTEND_URL=https://your-frontend.netlify.app
SPRING_PROFILES_ACTIVE=prod
```

**Step 5: Deploy**
- Render auto-deploys on git push

### Frontend on Netlify

```bash
cd hall-booking-frontend

# Build for production
npm run build

# Deploy
npm install -g netlify-cli
netlify deploy --prod

# Or use Netlify UI
# 1. Go to netlify.com
# 2. Drag & drop the 'build' folder
```

---

## 🔧 Option 3: Deploy to Heroku

### Backend on Heroku

**Step 1: Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Verify
heroku --version
```

**Step 2: Create Heroku App**
```bash
# Login
heroku login

# Create app
heroku create hall-booking-backend

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend.netlify.app
heroku config:set SPRING_PROFILES_ACTIVE=prod
```

**Step 3: Create Procfile**
Create file `Procfile` in project root:
```
web: java -jar target/hall-booking-system-1.0.0.jar
```

**Step 4: Deploy**
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

---

## 📱 Option 4: Deploy to AWS (Advanced)

### Backend on Elastic Beanstalk

**Step 1: Install AWS CLI & EB CLI**
```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Install EB CLI
pip install awsebcli
```

**Step 2: Initialize Elastic Beanstalk**
```bash
# Create application
eb init -p java-17 hall-booking-backend

# Create environment
eb create production-env

# Set environment variables
eb setenv JWT_SECRET=your-secret \
  DATABASE_URL=your-db-url \
  FRONTEND_URL=https://your-frontend.com
```

**Step 3: Deploy**
```bash
mvn clean package
eb deploy
```

### Frontend on S3 + CloudFront

```bash
cd hall-booking-frontend

# Build
npm run build

# Create S3 bucket
aws s3 mb s3://hall-booking-frontend

# Upload build
aws s3 sync build/ s3://hall-booking-frontend --acl public-read

# Enable static website hosting
aws s3 website s3://hall-booking-frontend \
  --index-document index.html \
  --error-document index.html
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use `.env` files:

**Backend `.env`:**
```
JWT_SECRET=generate-with-openssl-rand-base64-64
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
```

### 2. HTTPS Only
- All platforms provide free SSL certificates
- Enforce HTTPS in production

### 3. Database Security
- Use strong passwords
- Enable SSL connections
- Restrict database access by IP

### 4. CORS Configuration
- Only allow your frontend domain
- No wildcards in production

---

## 📊 Monitoring & Logging

### Application Logs

**Railway:**
```bash
# View logs
railway logs
```

**Heroku:**
```bash
heroku logs --tail
```

**Render:**
- View in dashboard → Logs tab

### Database Monitoring

Most platforms provide:
- Connection pool metrics
- Query performance
- Storage usage

---

## 🧪 Testing Deployment

### Backend Health Check
```bash
# Check if backend is running
curl https://your-backend.railway.app/api/halls

# Test authentication
curl -X POST https://your-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usernameOrEmail":"admin","password":"admin123"}'
```

### Frontend Check
1. Open: https://your-frontend.vercel.app
2. Test login
3. Test hall browsing
4. Test booking creation

---

## 🚨 Common Issues & Solutions

### Issue 1: CORS Errors
**Solution:** Update `allowed.origins` in backend config with frontend URL

### Issue 2: Database Connection Failed
**Solution:** Check DATABASE_URL format:
```
postgresql://username:password@host:5432/database
```

### Issue 3: 404 on React Routes
**Solution:** Add `_redirects` file in frontend `public/` folder:
```
/*    /index.html   200
```

For Vercel, add `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Issue 4: JWT Token Not Working
**Solution:**
- Ensure JWT_SECRET is set in production
- Check CORS allows credentials
- Verify token expiration time

---

## 💰 Cost Estimates

### Free Tier Limits

**Railway:**
- $5 free credit/month
- PostgreSQL: 500MB storage
- Good for small projects

**Vercel:**
- Unlimited deployments
- 100GB bandwidth/month
- Great for frontend

**Render:**
- Free web services sleep after 15 min inactivity
- PostgreSQL: 1GB storage, 90 days retention

**Netlify:**
- 100GB bandwidth/month
- Unlimited builds

### Recommended Free Stack
- **Backend**: Railway ($5/month credit)
- **Frontend**: Vercel (free)
- **Database**: Railway PostgreSQL (included)
- **Total**: FREE for small apps

---

## 📝 Quick Deployment Checklist

- [ ] Switch from H2 to PostgreSQL
- [ ] Set up environment variables
- [ ] Update CORS configuration
- [ ] Create production build
- [ ] Deploy backend to Railway/Render/Heroku
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Test all features in production
- [ ] Set up custom domain (optional)
- [ ] Enable monitoring and alerts
- [ ] Document API endpoints

---

## 🎓 Recommended Deployment Path (Easiest)

**For Beginners:**
1. **Backend**: Railway (auto-detects Spring Boot, includes PostgreSQL)
2. **Frontend**: Vercel (one-click deploy from GitHub)
3. **Time**: 15-20 minutes total

**Steps:**
```bash
# 1. Push code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Deploy backend on Railway (use their UI)
# 3. Deploy frontend on Vercel
cd hall-booking-frontend
vercel --prod

# Done! Your app is live 🎉
```

---

## 📚 Additional Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Spring Boot on Heroku: https://devcenter.heroku.com/articles/deploying-spring-boot-apps-to-heroku
- PostgreSQL Best Practices: https://wiki.postgresql.org/wiki/Don't_Do_This

---

## 🎯 Summary

Your Hall Booking System can be deployed to the internet in under 20 minutes using:
- **Railway** for backend (includes PostgreSQL)
- **Vercel** for frontend
- **Total Cost**: FREE

Both platforms offer automatic deployments from GitHub, SSL certificates, and easy environment variable management.

Good luck with your deployment! 🚀
