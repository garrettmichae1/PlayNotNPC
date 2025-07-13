# 🚀 Deployment Guide - Real Life XP App

## 📋 **Prerequisites**

1. **GitHub Repository**: Your code should be pushed to GitHub
2. **MongoDB Atlas Account**: For cloud database
3. **Environment Variables**: Set up your configuration

## 🔧 **Environment Variables Setup**

Create a `.env` file in your project root with:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/real-life-xp?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Environment
NODE_ENV=production

# Port (will be set by deployment platform)
PORT=5000

# Optional: Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🌐 **Deployment Options**

### **Option 1: Render (Recommended)**

1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub** repository
3. **Create a new Web Service**
4. **Configure the service**:
   - **Name**: `real-life-xp-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `NODE_ENV`: `production`

6. **Deploy** and wait for build to complete

### **Option 2: Railway**

1. **Sign up** at [railway.app](https://railway.app)
2. **Connect your GitHub** repository
3. **Create a new project**
4. **Add environment variables**:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NODE_ENV=production`

5. **Deploy** automatically

### **Option 3: Heroku**

1. **Sign up** at [heroku.com](https://heroku.com)
2. **Install Heroku CLI**
3. **Login and create app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

4. **Add environment variables**:
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-uri"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV="production"
   ```

5. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🗄️ **MongoDB Atlas Setup**

1. **Create account** at [mongodb.com/atlas](https://mongodb.com/atlas)
2. **Create a new cluster** (free tier)
3. **Create database user** with read/write permissions
4. **Get connection string** and replace placeholders:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/real-life-xp?retryWrites=true&w=majority
   ```
5. **Add your IP** to network access (or use 0.0.0.0/0 for all IPs)

## 🔐 **Security Setup**

### **Generate JWT Secret**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### **Update CORS Settings**
In `server.js`, update the CORS origins for production:
```javascript
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-app-name.onrender.com'] // Replace with your domain
        : ['http://localhost:3000', 'http://localhost:5000'],
    credentials: true
};
```

## 📱 **Mobile Testing After Deployment**

1. **Update mobile testing guide** with your new domain
2. **Test all mobile features** on the deployed app
3. **Verify API endpoints** work correctly
4. **Check mobile navigation** and touch interactions

## 🧪 **Testing Checklist**

- [ ] App loads without errors
- [ ] User registration/login works
- [ ] Activity tracking functions properly
- [ ] Mobile navigation works
- [ ] API endpoints respond correctly
- [ ] Database connections are stable
- [ ] Mobile optimizations work
- [ ] Charts and analytics display properly

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Build Fails**:
   - Check `package.json` has correct start script
   - Verify all dependencies are listed
   - Check Node.js version compatibility

2. **Database Connection Fails**:
   - Verify MongoDB URI is correct
   - Check network access settings
   - Ensure database user has proper permissions

3. **App Crashes**:
   - Check environment variables are set
   - Review server logs for errors
   - Verify port configuration

4. **Mobile Issues**:
   - Update CORS settings for your domain
   - Check HTTPS requirements
   - Test on real mobile devices

## 📊 **Monitoring**

### **Health Check Endpoint**
Your app includes a health check at `/health` that returns:
- Server status
- Database connection status
- Uptime information
- Environment details

### **Logs**
Monitor your deployment platform's logs for:
- Application errors
- Database connection issues
- Performance metrics
- User activity

## 🚀 **Post-Deployment**

1. **Update documentation** with new URLs
2. **Test all features** thoroughly
3. **Set up monitoring** and alerts
4. **Configure custom domain** (optional)
5. **Set up SSL certificate** (usually automatic)

## 📞 **Support**

If you encounter issues:
1. Check the deployment platform's documentation
2. Review server logs for error messages
3. Verify environment variables are set correctly
4. Test locally with production environment variables

---

**Your app is ready for deployment!** 🎉 