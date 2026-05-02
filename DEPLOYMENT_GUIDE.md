# Deployment Guide

## 🚀 Deploy WhatsApp Clone to Production

This guide covers deploying to various platforms.

---

## 📦 Option 1: Docker & Docker Compose (Recommended)

### Prerequisites
- Docker installed
- Docker Compose installed

### Steps

1. **Build images:**
```bash
docker-compose build
```

2. **Start services:**
```bash
docker-compose up -d
```

3. **Check status:**
```bash
docker-compose ps
```

4. **View logs:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

5. **Access application:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

6. **Stop services:**
```bash
docker-compose down
```

---

## 🌐 Option 2: Deploy Backend to Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed
- Git repository initialized

### Steps

1. **Login to Heroku:**
```bash
heroku login
```

2. **Create Heroku app:**
```bash
cd backend
heroku create your-app-name-backend
```

3. **Set environment variables:**
```bash
heroku config:set MONGODB_URI=<your-mongodb-atlas-uri>
heroku config:set CLIENT_URL=https://your-frontend-url.com
```

4. **Add Heroku remote to package.json:**

Update `package.json`:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

5. **Deploy:**
```bash
git push heroku main
```

6. **View logs:**
```bash
heroku logs --tail
```

7. **Access backend:**
```
https://your-app-name-backend.herokuapp.com
```

### Heroku Limitations
- Free tier has limited hours
- Database may need upgrade
- Use MongoDB Atlas for production

---

## 🌐 Option 3: Deploy Frontend to Vercel

### Prerequisites
- Vercel account
- Vercel CLI (optional)
- Git repository

### Steps

1. **Build optimized bundle:**
```bash
cd frontend
npm run build
```

2. **Using Git (Recommended):**
   - Push code to GitHub
   - Connect GitHub to Vercel
   - Auto-deploys on push

3. **Using Vercel CLI:**
```bash
npm install -g vercel
vercel
```

4. **Set environment variables in Vercel dashboard:**
```
REACT_APP_API_URL=https://your-backend-url.com/api
REACT_APP_SOCKET_URL=https://your-backend-url.com
```

5. **Deploy:**
```bash
vercel --prod
```

6. **Access frontend:**
```
https://your-app-name.vercel.app
```

---

## 🌐 Option 4: Deploy Frontend to Netlify

### Prerequisites
- Netlify account
- Git repository

### Steps

1. **Build app:**
```bash
cd frontend
npm run build
```

2. **Using Netlify UI:**
   - Connect GitHub to Netlify
   - Select repository
   - Build command: `npm run build`
   - Publish directory: `build`
   - Deploy

3. **Using Netlify CLI:**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

4. **Set environment variables:**
   - Go to Netlify dashboard
   - Site settings → Build & deploy → Environment
   - Add variables:
     - `REACT_APP_API_URL`
     - `REACT_APP_SOCKET_URL`

5. **Access frontend:**
```
https://your-app-name.netlify.app
```

---

## ☁️ Option 5: Deploy to AWS (Full Stack)

### Backend - EC2 or ECS

**EC2 Deployment:**

1. Launch EC2 instance (Node.js AMI)
2. SSH into instance
3. Clone repository
4. Install dependencies
5. Set environment variables
6. Start server with PM2:
```bash
npm install -g pm2
pm2 start server.js --name "whatsapp-backend"
pm2 save
```
7. Set up NGINX reverse proxy
8. Configure SSL with Let's Encrypt

**ECS/Fargate Deployment:**

1. Create Docker images
2. Push to ECR
3. Create ECS cluster
4. Define task definitions
5. Create services
6. Configure load balancer

### Database - RDS MongoDB

1. Use MongoDB Atlas (easier)
2. Create cluster with VPC peering to EC2/ECS
3. Update `MONGODB_URI` with connection string

### Frontend - S3 + CloudFront

1. Build React app
2. Upload `build/` to S3 bucket
3. Configure S3 for static hosting
4. Create CloudFront distribution
5. Configure custom domain
6. Enable HTTPS

---

## 🌐 Option 6: Deploy to Google Cloud Platform

### App Engine (Backend)

1. Install Google Cloud SDK
2. Initialize project:
```bash
gcloud init
gcloud app create
```

3. Create `app.yaml`:
```yaml
runtime: nodejs18

env: standard

env_variables:
  MONGODB_URI: "your-connection-string"
  CLIENT_URL: "https://your-frontend.com"
```

4. Deploy:
```bash
gcloud app deploy
```

### Firebase Hosting (Frontend)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase:
```bash
firebase init
```

3. Build app:
```bash
npm run build
```

4. Deploy:
```bash
firebase deploy
```

---

## 🌐 Option 7: Deploy to Azure

### Azure App Service (Backend)

1. Create resource group:
```bash
az group create --name myResourceGroup --location eastus
```

2. Create App Service plan:
```bash
az appservice plan create --name myAppPlan --resource-group myResourceGroup --sku B1 --is-linux
```

3. Create web app:
```bash
az webapp create --resource-group myResourceGroup --plan myAppPlan --name myBackendApp --runtime "NODE|18-lts"
```

4. Deploy code:
```bash
az webapp deployment source config-zip --resource-group myResourceGroup --name myBackendApp --src deployment.zip
```

### Azure Static Web Apps (Frontend)

1. Create static web app through Azure Portal
2. Connect GitHub repository
3. Configure build settings
4. Auto-deploys on push

---

## 📊 Database Deployment Options

### MongoDB Atlas (Recommended for Cloud)

1. Create account at https://mongodb.com/cloud/atlas
2. Create cluster
3. Create database user
4. Get connection string
5. Add to environment variables

### Self-Hosted MongoDB

**On AWS EC2:**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo
```

---

## 🔐 Production Security Checklist

- [ ] Enable HTTPS/SSL
- [ ] Use environment variables for secrets
- [ ] Enable CORS properly (specific origins)
- [ ] Set secure headers
- [ ] Enable rate limiting
- [ ] Use API authentication (JWT/OAuth)
- [ ] Validate all inputs
- [ ] Use HTTPS for database connections
- [ ] Enable database authentication
- [ ] Regular backups
- [ ] Monitor logs and errors
- [ ] Use secrets manager (AWS Secrets Manager, Azure Key Vault)

### Add Security Headers (Express):

```javascript
const express = require('express');
const helmet = require('helmet');

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

---

## 📈 Performance Optimization

### Backend
- Use caching (Redis)
- Enable compression
- Database indexing
- Load balancing
- CDN for static assets

### Frontend
- Code splitting
- Lazy loading
- Production build
- Minification
- Compression

---

## 📝 Environment Variables for Production

**Backend `.env`:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=5000
CLIENT_URL=https://your-frontend.com
NODE_ENV=production
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=https://your-backend.com/api
REACT_APP_SOCKET_URL=https://your-backend.com
```

---

## 🔍 Monitoring

### Log Management
- CloudWatch (AWS)
- Stack Driver (GCP)
- Application Insights (Azure)

### Error Tracking
- Sentry
- Rollbar
- New Relic

### Performance Monitoring
- New Relic
- DataDog
- Prometheus

---

## 🚨 Troubleshooting

### CORS Issues
- Check `CLIENT_URL` in backend `.env`
- Verify allowed origins

### Connection Timeouts
- Check firewall rules
- Verify database is accessible
- Check network connectivity

### Deploy Fails
- Check logs
- Verify all dependencies installed
- Check build script
- Verify environment variables

### Socket.IO Not Working
- Ensure WebSocket support enabled
- Check proxy configuration
- Verify CORS headers

---

## 📞 Support

For deployment issues:
1. Check logs
2. Review documentation
3. Check GitHub issues
4. Ask on Stack Overflow

---

**Happy deploying! 🚀**
