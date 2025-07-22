PlayNotNPC — Real-Life XP Tracker
Level up your life. Track habits, earn XP, and make progress feel like a game.
Fully functional planner/calendar, diary, level/achievement system, and social features like adding friends.
Decently documented easy to extend.

Table of Contents
- What Is This?
- Key Features
- Tech Stack
- Folder Breakdown
- How to Run It Locally
- Environment Setup
- Deploying It
- Security Stuff
- Tweak It Your Way
- Contributing
- License

What Is This?
PlayNotNPC is a full-stack habit and productivity tracker that turns your real life actions into XP. Whether you're working out, studying, or just staying consistent, you log it, earn XP, and level up. You can unlock achievements, track streaks, and even challenge friends. It’s built to be mobile-friendly, secure, and easy to extend.

Key Features
-  Login/Register — JWT-based auth, no nonsense.
-  Activity Logging — Track anything: workouts, study time, deep work, etc.
-  XP System — XP scales with effort, levels up over time, and carries over.
- Achievements — Milestones, streaks, and special unlocks.
-  Dashboard — Stats, streaks, and progress analytics.
-  Friends & Challenges — Add friends, compete, and climb leaderboards.
-  Mobile-First — Responsive UI, PWA support, works offline.
-  Stripe Tips — Optional tipping to support dev work.
-  Security — CORS, rate limiting, input validation, secure headers.
-  Modular Codebase — Easy to maintain and extend.

Tech Stack
- Backend: Node.js + Express + MongoDB (Atlas)
- Frontend: HTML/CSS + Vanilla JS (modular, no frameworks)
- DevOps: Environment configs, health checks, error handling
- PWA: Service worker, manifest, installable app

Folder Breakdown
real-life-xp/
├── modules/        # Frontend logic (auth, XP, achievements, etc.)
├── routes/         # Express API routes
├── models/         # Mongoose schemas
├── middleware/     # Security, validation, error handling
├── services/       # XP logic, query optimization
├── config/         # DB connection and app config
├── utils/          # Helper functions
├── public/         # Static files (HTML, CSS, JS)
├── sw.js           # Service worker
├── manifest.json   # PWA manifest
├── server.js       # App entry point
└── ...



How to Run It Locally
git clone https://github.com/garrettmichae1/playnotnpc.git
cd playnotnpc
npm install
npm start


- App runs at http://localhost:5000
- For mobile testing, use your LAN IP (e.g., http://192.168.x.x:5000)

Environment Setup
Create a .env file in the root with:
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
APP_URL=https://playnotnpc.com
STRIPE_SECRET_KEY=your_stripe_secret_key

Deploying It
I used Render.com
- Hook up your GitHub repo
- Add your env vars
- Use npm start as the start command

Security Stuff
- JWT for auth
- CORS locked down in production
- Rate limiting (add express-rate-limit)
- Input validation on all endpoints
- HTTPS enforced (via platform or proxy)
- Centralized error handling
- Secrets stored in env vars

Tweak It Your Way
-  Theme: Edit styles.css for colors and branding
-  Achievements: Customize logic in modules/achievements.js
-  XP System: Adjust XP rules in modules/xpManager.js
-  New Activities: Add types in modules/tracker.js and backend routes
-  PWA: Update manifest.json and sw.js for icons and offline behavior

Contributing
If you want to help out:
- Fork the repo and make a new branch
- Keep your code clean and commented
- Add tests if needed
- Submit a pull request with a clear description

License
MIT. Do what you want, just don’t be shady.

Contact: Questions, ideas, or business stuff = garrettiswoodside@gmail.com
