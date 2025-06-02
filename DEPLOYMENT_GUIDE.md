# 🚀 AI Sprint Manager - Deployment Guide

## Overview
This guide covers deploying the AI Sprint Manager application with:
- **Backend**: Render (Node.js + MySQL)
- **Frontend**: Vercel (React + Vite)

## 📋 Prerequisites

### Required Accounts
- [Render](https://render.com) account (free tier available)
- [Vercel](https://vercel.com) account (free tier available)
- [PlanetScale](https://planetscale.com) or [Render PostgreSQL](https://render.com/docs/databases) for database
- [Gmail](https://gmail.com) account for SMTP
- [OpenAI](https://openai.com) API key

### Required Information
- Gmail app password (for SMTP)
- OpenAI API key
- Strong JWT secrets (will be generated)

## 🗄️ PHASE 1: Database Setup

### Option A: PlanetScale (MySQL - Recommended)
1. Create account at [PlanetScale](https://planetscale.com)
2. Create new database: `ai-sprint-manager`
3. Get connection details from dashboard
4. Note: Connection string format: `mysql://username:password@host:port/database`

### Option B: Render PostgreSQL
1. In Render dashboard, create new PostgreSQL database
2. Name: `ai-sprint-db`
3. Get connection details from dashboard

## 🔧 PHASE 2: Backend Deployment (Render)

### Step 1: Prepare Repository
1. Ensure all files are committed and pushed to GitHub
2. Verify `backend/package.json` has correct start script: `"start": "node server.js"`

### Step 2: Create Render Web Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure service:
   - **Name**: `ai-sprint-manager-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 3: Configure Environment Variables
Add these environment variables in Render dashboard:

#### Required Variables (Set these manually):
```
NODE_ENV=production
PORT=10000
API_VERSION=v1
FRONTEND_URL=https://your-app-name.vercel.app
OPENAI_API_KEY=your-openai-api-key-here
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
```

#### Database Variables (from your database provider):
```
DB_HOST=your-db-host
DB_PORT=3306
DB_NAME=ai-sprint-manager
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

#### Auto-generated Variables (Render can generate these):
```
JWT_SECRET=generate-strong-secret
JWT_REFRESH_SECRET=generate-different-strong-secret
```

#### Default Variables (copy as-is):
```
DB_CONNECTION_LIMIT=10
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
FROM_NAME=AI Sprint Manager
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4000
OPENAI_TEMPERATURE=0.3
UPLOAD_PATH=/tmp/uploads/
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
LOG_FILE=/tmp/logs/app.log
AI_QUOTA_LIMIT=100
AI_QUOTA_RESET_DAYS=30
```

### Step 4: Deploy Backend
1. Click "Create Web Service"
2. Wait for deployment to complete
3. Note your backend URL: `https://your-service-name.onrender.com`
4. Test health check: `https://your-service-name.onrender.com/api/v1/health`

## 🌐 PHASE 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
1. Update `frontend/.env.production` with your backend URL
2. Ensure `frontend/package.json` has correct build script: `"build": "vite build"`

### Step 2: Deploy to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Configure Environment Variables
Add these in Vercel dashboard under "Environment Variables":

```
VITE_API_BASE_URL=https://your-render-backend-url.onrender.com/api/v1
VITE_API_TIMEOUT=10000
VITE_APP_NAME=SprintFlow
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Modern AI Sprint Management Platform
VITE_NODE_ENV=production
VITE_ENABLE_AI_FEATURES=true
VITE_ENABLE_TIME_TRACKING=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_DRAG_DROP=true
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
VITE_DEFAULT_LANGUAGE=en
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx
VITE_DEFAULT_PAGE_SIZE=20
VITE_MAX_PAGE_SIZE=100
VITE_TOAST_DURATION=5000
VITE_TOAST_POSITION=top-right
VITE_ENABLE_REDUX_DEVTOOLS=false
VITE_ENABLE_CONSOLE_LOGS=false
VITE_ENABLE_ERROR_BOUNDARY=true
VITE_ANALYTICS_ENABLED=false
```

### Step 4: Deploy Frontend
1. Click "Deploy"
2. Wait for deployment to complete
3. Note your frontend URL: `https://your-app-name.vercel.app`

## 🔄 PHASE 4: Connect Frontend and Backend

### Step 1: Update Backend CORS
1. Go to Render dashboard
2. Update `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy backend service

### Step 2: Test Integration
1. Visit your frontend URL
2. Try to register/login
3. Test AI features
4. Check browser console for errors

## 📊 PHASE 5: Database Migration

### Run Database Migrations
1. Connect to your database using a MySQL client
2. Run the migration script from `backend/scripts/migrate.js`
3. Optionally run seed data from `backend/scripts/seed.js`

### Alternative: Use Render Shell
1. In Render dashboard, go to your web service
2. Click "Shell" tab
3. Run: `npm run db:migrate`
4. Run: `npm run db:seed` (optional)

## ✅ PHASE 6: Verification Checklist

### Backend Health Checks
- [ ] `https://your-backend.onrender.com/health` returns 200
- [ ] `https://your-backend.onrender.com/api/v1/health` returns 200
- [ ] Database connection working
- [ ] AI service initialized

### Frontend Checks
- [ ] Application loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] API calls to backend successful
- [ ] AI features functional

### Integration Checks
- [ ] CORS configured correctly
- [ ] Authentication flow works
- [ ] File uploads work (if applicable)
- [ ] Email notifications work

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
- **Database connection failed**: Check DB credentials and network access
- **CORS errors**: Verify FRONTEND_URL matches your Vercel domain
- **OpenAI errors**: Verify API key and quota limits
- **Email errors**: Check Gmail app password and SMTP settings

#### Frontend Issues
- **API calls failing**: Check VITE_API_BASE_URL points to correct backend
- **Build failures**: Check for TypeScript errors or missing dependencies
- **Environment variables not working**: Ensure they start with `VITE_`

### Logs and Debugging
- **Render logs**: Available in Render dashboard under "Logs" tab
- **Vercel logs**: Available in Vercel dashboard under "Functions" tab
- **Browser console**: Check for JavaScript errors and network failures

## 🚀 Going Live

### Custom Domain (Optional)
1. **Vercel**: Add custom domain in project settings
2. **Render**: Add custom domain in service settings
3. Update CORS and environment variables accordingly

### Performance Optimization
1. Enable Vercel Analytics
2. Set up monitoring and alerts
3. Configure CDN for static assets
4. Implement caching strategies

### Security Considerations
1. Rotate JWT secrets regularly
2. Monitor API usage and rate limits
3. Set up proper backup strategies
4. Enable HTTPS everywhere

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render and Vercel documentation
3. Check application logs for specific error messages
4. Verify all environment variables are set correctly

---

**Deployment Complete!** 🎉

Your AI Sprint Manager should now be live and accessible to users worldwide.
