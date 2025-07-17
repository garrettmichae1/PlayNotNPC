# PlayNotNPC — Real-Life XP Gamified Tracker

**Level up your life. Track, analyze, and gamify your real-world achievements.**

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Security](#security)
- [Customization](#customization)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
PlayNotNPC is a full-stack productivity and habit-tracking platform that transforms your daily activities into a gamified experience. Users log real-life activities, earn XP, level up, unlock achievements, and compete with friends—all within a secure, scalable, and mobile-optimized environment.

---

## Features
- **User Authentication:** Secure JWT-based registration and login.
- **Activity Logging:** Track workouts, study sessions, work, and more.
- **XP & Level System:** Dynamic XP calculation, multi-level progression, and XP carryover.
- **Achievements:** Unlock badges for milestones, streaks, and special actions.
- **Dashboard:** Real-time stats, streaks, and analytics.
- **Friends & Challenges:** Add friends, compete in challenges, and view leaderboards.
- **Mobile-First Design:** Responsive UI, PWA support, and offline capabilities.
- **Stripe Integration:** Secure tipping for developer support.
- **Robust Security:** CORS, rate limiting, input validation, and secure headers.
- **Extensible & Maintainable:** Modular codebase, clear documentation, and scalable architecture.

---

## Architecture
- **Backend:** Node.js, Express.js, MongoDB (Atlas), RESTful API, modular middleware.
- **Frontend:** HTML5, CSS3, Vanilla JS (modular, no frontend framework), responsive/mobile-first.
- **DevOps:** Environment-based config, production-ready CORS, error handling, and health checks.
- **PWA:** Service worker, manifest, offline support, and installable app experience.

---

## Project Structure
```
real-life-xp/
├── modules/        # Frontend logic (auth, XP, achievements, onboarding, etc.)
├── routes/         # Express API routes (users, activities, friends, etc.)
├── models/         # Mongoose models (User, Activity, Friend)
├── middleware/     # Security, error handling, validation
├── services/       # Business logic (XP, query optimization)
├── config/         # Database connection and config
├── utils/          # Utility functions
├── public/         # Static assets (HTML, CSS, JS, icons)
├── sw.js           # Service worker for PWA
├── manifest.json   # PWA manifest
├── server.js       # Main server entry point
└── ...
```

---

## Getting Started
### Local Development
```bash
git clone https://github.com/garrettmichae1/playnotnpc.git
cd playnotnpc
npm install
npm start
```
- The app will be available at `http://localhost:5000` by default.
- For mobile testing, access via your LAN IP (e.g., `http://192.168.1.185:5000`).

### API Endpoints
- `/api/users` — User registration, login, profile
- `/api/activities` — Log and retrieve activities
- `/api/achievements` — Achievement progress and unlocks
- `/api/friends` — Friend management and challenges
- `/api/performance` — Analytics and stats
- `/health` — Health check endpoint

---

## Environment Variables
Create a `.env` file in the project root with the following keys:
```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
APP_URL=https://playnotnpc.com
STRIPE_SECRET_KEY=your_stripe_secret_key
```
- **Never commit your real `.env` file to version control.**

---

## Deployment
### Render.com
- Connect your GitHub repo, set environment variables, and use `npm start` as the start command.

---

## Security
- **JWT Authentication:** Secure, stateless sessions.
- **CORS:** Strict in production, permissive for local/mobile testing.
- **Rate Limiting:** Prevents brute-force and abuse (add express-rate-limit for production).
- **Input Validation:** All API endpoints validate and sanitize input.
- **HTTPS:** Enforced in production (via platform or reverse proxy).
- **Error Handling:** Centralized 404 and global error handlers.
- **Environment Variables:** All secrets and sensitive config are environment-based.

---

## Customization
- **UI Theme:** Edit `styles.css` for branding and color schemes.
- **Achievements:** Modify logic and badges in `modules/achievements.js`.
- **XP System:** Adjust XP calculation in `modules/xpManager.js`.
- **Add Activities:** Extend activity types in `modules/tracker.js` and backend routes.
- **PWA:** Update `manifest.json` and `sw.js` for icons, offline support, and push notifications.

---


## Contributing
1. Fork the repository and create a new branch for your feature or bugfix.
2. Write clear, maintainable code and add comments where necessary.
3. Ensure all new code is covered by tests (if applicable).
4. Submit a pull request with a detailed description of your changes.
5. All contributions are reviewed for security, maintainability, and clarity.

---

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

**Contact:** For questions, support, or business inquiries, email: garrettiswoodside@gmail.com
