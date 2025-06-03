# 🚀 AI Sprint Manager - Deployment Checklist

## Pre-Deployment Preparation

### 📋 Required Information Gathering
- [ ] Gmail account and app password ready
- [ ] OpenAI API key ready
- [ ] GitHub repository URL
- [ ] Chosen database provider (PlanetScale/Render PostgreSQL)

### 🔐 Security Preparation
- [ ] Generate strong JWT secrets (or let Render generate them)
- [ ] Prepare Gmail app password (not regular password)
- [ ] Verify OpenAI API key has sufficient credits

## 🗄️ Database Setup

### Database Provider Choice
- [ ] **Option A**: PlanetScale MySQL account created
- [ ] **Option B**: Render PostgreSQL database created
- [ ] Database connection details noted
- [ ] Database accessible from external connections

## 🔧 Backend Deployment (Render)

### Repository Setup
- [ ] All code committed and pushed to GitHub
- [ ] `backend/package.json` has `"start": "node server.js"`
- [ ] Health check endpoints working locally

### Render Service Creation
- [ ] Render account created
- [ ] New Web Service created
- [ ] GitHub repository connected
- [ ] Service configuration:
  - [ ] Name: `ai-sprint-manager-backend`
  - [ ] Environment: Node
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install`
  - [ ] Start Command: `npm start`

### Environment Variables Configuration
- [ ] **NODE_ENV**: `production`
- [ ] **PORT**: `10000`
- [ ] **API_VERSION**: `v1`
- [ ] **FRONTEND_URL**: `https://your-app-name.vercel.app` (update later)
- [ ] **Database variables**: All 5 DB_* variables set
- [ ] **JWT secrets**: Generated and set
- [ ] **SMTP variables**: Gmail credentials set
- [ ] **OpenAI variables**: API key and model settings
- [ ] **All other variables**: Copied from deployment guide

### Backend Deployment Verification
- [ ] Service deployed successfully
- [ ] Backend URL noted: `https://your-service.onrender.com`
- [ ] Health check working: `/health` returns 200
- [ ] API health check working: `/api/v1/health` returns 200
- [ ] Database connection confirmed in health check

## 🌐 Frontend Deployment (Vercel)

### Frontend Preparation
- [ ] `frontend/package.json` has `"build": "vite build"`
- [ ] Vite config updated for production
- [ ] Environment files prepared

### Vercel Project Creation
- [ ] Vercel account created
- [ ] New Project created
- [ ] GitHub repository imported
- [ ] Project configuration:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`

### Frontend Environment Variables
- [ ] **VITE_API_BASE_URL**: Backend URL set
- [ ] **VITE_NODE_ENV**: `production`
- [ ] **All VITE_* variables**: Set from deployment guide
- [ ] **Feature flags**: Enabled as needed
- [ ] **UI configuration**: Theme and language settings

### Frontend Deployment Verification
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted: `https://your-app.vercel.app`
- [ ] Application loads without errors
- [ ] No console errors in browser

## 🔄 Integration & Testing

### Backend-Frontend Connection
- [ ] Backend `FRONTEND_URL` updated with Vercel URL
- [ ] Backend redeployed with new CORS settings
- [ ] CORS working (no CORS errors in browser)

### Database Migration
- [ ] Database migration script executed
- [ ] Tables created successfully
- [ ] Seed data loaded (optional)
- [ ] Database schema verified

### Functionality Testing
- [ ] **User Registration**: Working end-to-end
- [ ] **User Login**: Authentication successful
- [ ] **API Calls**: Frontend can reach backend
- [ ] **AI Features**: OpenAI integration working
- [ ] **Email**: Registration/notification emails sent
- [ ] **File Uploads**: Avatar uploads working (if applicable)

### Performance & Security
- [ ] **HTTPS**: Both frontend and backend use HTTPS
- [ ] **Rate Limiting**: API rate limits working
- [ ] **Error Handling**: Proper error responses
- [ ] **Logging**: Application logs visible in dashboards

## 🎯 Final Verification

### Health Checks
- [ ] Backend health endpoint: `GET /health`
- [ ] API health endpoint: `GET /api/v1/health`
- [ ] Frontend loads completely
- [ ] All API endpoints responding

### User Journey Testing
- [ ] **Registration Flow**: New user can register
- [ ] **Login Flow**: User can login successfully
- [ ] **Dashboard**: User dashboard loads with data
- [ ] **Project Creation**: Can create new projects
- [ ] **Sprint Management**: Can create and manage sprints
- [ ] **AI Features**: AI sprint planning works
- [ ] **Issue Management**: Can create and manage issues

### Monitoring Setup
- [ ] **Render Logs**: Accessible and readable
- [ ] **Vercel Logs**: Accessible and readable
- [ ] **Error Tracking**: Errors properly logged
- [ ] **Performance**: Response times acceptable

## 🚀 Go-Live Checklist

### Documentation
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Access credentials stored securely
- [ ] Troubleshooting guide available

### Backup & Recovery
- [ ] Database backup strategy in place
- [ ] Environment variables backed up
- [ ] Repository tagged with deployment version

### Communication
- [ ] Team notified of deployment
- [ ] Users informed of new application URL
- [ ] Support documentation updated

## 📊 Post-Deployment

### Monitoring (First 24 Hours)
- [ ] **Error Rates**: Monitor for unusual errors
- [ ] **Performance**: Check response times
- [ ] **Usage**: Monitor user registrations and activity
- [ ] **Costs**: Verify usage within free tier limits

### Optimization (First Week)
- [ ] **Performance Tuning**: Optimize slow endpoints
- [ ] **User Feedback**: Collect and address user issues
- [ ] **Feature Validation**: Ensure all features work as expected
- [ ] **Security Review**: Verify security measures are effective

---

## 🎉 Deployment Status

- [ ] **Backend Deployed**: ✅ Live at `https://your-backend.onrender.com`
- [ ] **Frontend Deployed**: ✅ Live at `https://your-app.vercel.app`
- [ ] **Database Connected**: ✅ All tables created and accessible
- [ ] **Integration Working**: ✅ Frontend and backend communicating
- [ ] **AI Features Active**: ✅ OpenAI integration functional
- [ ] **Email Service Active**: ✅ SMTP working for notifications

**🚀 DEPLOYMENT COMPLETE!**

Your AI Sprint Manager is now live and ready for users!
