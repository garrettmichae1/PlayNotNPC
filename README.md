# Real Life XP - Gamified Activity Tracker

A full-stack web application that gamifies real-life activities with XP, levels, and achievements.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Deployment

#### Option 1: Render.com (Free Tier)
1. **Connect your GitHub repo** to Render
2. **Create a Web Service** with these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_jwt_secret
     PORT=10000
     ```

#### Option 2: Railway.app
1. **Deploy from GitHub** to Railway
2. **Add environment variables** in Railway dashboard
3. **Auto-deploys** on git push

#### Option 3: Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

## 🔧 Production Setup

### 1. Environment Variables
Create `.env` file:
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/real-life-xp
JWT_SECRET=your-super-secret-jwt-key
PORT=5000
```

### 2. Database Setup
- **MongoDB Atlas** (free tier available)
- **Create database** and user
- **Whitelist IP addresses** (0.0.0.0/0 for all)

### 3. Security Enhancements
- **HTTPS** (automatic with most cloud providers)
- **Rate limiting** (add `express-rate-limit`)
- **CORS configuration** for production domains
- **Input validation** with Joi or express-validator

## 📱 User Features

### Current Features
- ✅ User authentication (login/register)
- ✅ Activity tracking with XP system
- ✅ Level progression (1-100+)
- ✅ Statistics dashboard
- ✅ Streak counting
- ✅ Achievement badges

### Planned Features
- 📅 **Calendar view** of activities
- 📊 **Advanced analytics** and charts
- 🏆 **Leaderboards** and social features
- 🎯 **Goal setting** and reminders
- 📱 **Mobile app** (React Native)
- 🔔 **Push notifications**

## 🛠️ Development Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Activity tracking
- [x] XP/Level system
- [x] Basic statistics

### Phase 2: Enhanced UX 🚧
- [ ] Calendar integration
- [ ] Data visualization
- [ ] Mobile responsiveness
- [ ] Dark mode

### Phase 3: Social Features 📈
- [ ] User profiles
- [ ] Friend system
- [ ] Activity sharing
- [ ] Community challenges

### Phase 4: Advanced Features 🎯
- [ ] Goal setting
- [ ] Habit tracking
- [ ] AI insights
- [ ] Export data

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] JWT secret changed
- [ ] Database credentials secure
- [ ] Input validation added
- [ ] Rate limiting implemented
- [ ] CORS configured
- [ ] Error handling improved

## 📊 Analytics & Monitoring

### Recommended Tools
- **Google Analytics** for user behavior
- **Sentry** for error tracking
- **MongoDB Atlas** for database monitoring
- **Uptime Robot** for availability monitoring

## 🎨 Customization

### Branding
- Update colors in `styles.css`
- Replace logo and favicon
- Customize achievement badges
- Modify XP calculation formulas

### Features
- Add new activity types
- Create custom achievements
- Implement different leveling curves
- Add gamification elements

## 📞 Support

For issues or feature requests:
- Create GitHub issue
- Email: support@reallifexp.com
- Discord: [Join our community]

---

**Built with ❤️ using Node.js, Express, MongoDB, and Vanilla JavaScript**