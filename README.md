PlayNotNPC — Real-Life XP Gamified Tracker
Don’t just live life. Level it up.

PlayNotNPC is a full-stack productivity tracker that turns your real-life habits into a game. You earn XP, level up, unlock achievements, and track streaks as you progress through personal goals — fitness, study, finances, and more. Designed with scalability, security, and mobile-first UX in mind.

🔥 Key Technologies
Frontend:

HTML5, CSS3, Vanilla JS

Responsive design (mobile-first)

Modular JS architecture

Backend:

Node.js + Express.js

MongoDB (Atlas)

JWT-based Authentication

RESTful API design

DevOps & Hosting:

Deploy-ready for: Render, Railway, Heroku

Environment-based configuration (.env)

Production-grade settings (CORS, rate limiting, security middleware)

🚀 Getting Started
📦 Local Development
bash
Copy
Edit
git clone https://github.com/yourusername/playnotnpc.git
cd playnotnpc
npm install
npm run dev
🌐 Deployment Options
🔧 Common Environment Variables
env
Copy
Edit
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_super_secret
PORT=5000
✅ Deploy to Render.com
Connect GitHub → New Web Service

Build Command: npm install

Start Command: npm start

Set environment variables above

✅ Deploy to Railway.app
One-click GitHub deployment

Add .env variables in dashboard

Auto-deploy on git push

✅ Deploy to Heroku
bash
Copy
Edit
heroku create playnotnpc
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=...
heroku config:set JWT_SECRET=...
git push heroku main
🎯 Core Features (Live & Functional)
✅ Secure auth system (JWT)
✅ Activity logging with XP gain
✅ Level progression (1-100+)
✅ Dashboard with stats + streaks
✅ Achievement badges
✅ Fully mobile-optimized UI
✅ Modular, scalable codebase

📍 Planned Enhancements
🗓 Calendar view for history
📊 Graphs + advanced analytics
🏆 Friend system & leaderboards
🎯 Goal setting + habit tracking
📱 React Native mobile app
🔔 Push notifications

🛡 Security & Best Practices
✅ JWT with env-configurable secret

✅ MongoDB with role-based access

✅ Rate limiting (express-rate-limit)

✅ Input validation (express-validator)

✅ CORS setup for production

✅ 404/500 error handling

🔐 HTTPS auto-enabled (via platform)

📊 Monitoring Tools (Suggested)
Google Analytics — user behavior

MongoDB Atlas — DB performance

Sentry — real-time error logging

UptimeRobot — basic uptime monitoring

🎨 Customization Guide
🖌 UI Theme: Edit styles.css
🏅 Achievements: Customize badge logic
📈 XP System: Adjust XP formula in /modules/xpManager.js
🧩 New Activities: Extend /modules/tracker.js

📎 Project Structure Overview
bash
Copy
Edit
src/
├── modules/        # Core logic (auth, tracker, XP, storage)
├── public/         # Frontend files (HTML/CSS/JS)
├── routes/         # Express routes
├── utils/          # Reusable utilities
└── server.js       # Entry point
💼 Why This Project Matters
This isn’t just a to-do list in disguise. PlayNotNPC:

Demonstrates full-stack capability from UI/UX to deployment

Shows attention to security, scalability, and modularity

Is production-ready and deployable in under 10 minutes

Uses clean, maintainable code with no external frontend framework (vanilla JS for control)

EMAIL: garrettiswoodside@gmail.com
