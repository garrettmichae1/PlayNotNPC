const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { activityQueries, invalidateCache } = require('../services/queryOptimizer');

// Debug middleware for all activity routes
router.use((req, res, next) => {
    console.log('\n=== ACTIVITY ROUTE REQUEST START ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    console.log('User:', req.user);
    console.log('Headers:', req.headers);
    console.log('=== ACTIVITY ROUTE REQUEST END ===\n');
    next();
});

// Apply auth middleware to all routes
router.use(auth);

// Get all activities for a user - using optimized query with pagination and date filtering
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, startDate } = req.query;
        
        // Build query options
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            category: category || null,
            startDate: startDate || null
        };
        
        const result = await activityQueries.getUserActivities(req.user.userId, options);
        console.log('Activities query result:', result);
        console.log('Number of activities returned:', result.activities ? result.activities.length : 'No activities array');
        
        res.json(result);
    } catch (err) {
        console.error('Error fetching activities:', err);
        next(err);
    }
});

// Add new activity
router.post('/', async (req, res, next) => {
    try {
        const { type, title, duration } = req.body;
        console.log('Received activity:', { type, title, duration });
        console.log('User from auth middleware:', req.user);
        console.log('User ID:', req.user?.userId);

        // Input validation
        if (!type || !title || !duration) {
            console.log('Missing required fields:', { type, title, duration });
            return res.status(400).json({ message: 'Type, title, and duration are required.' });
        }
        if (typeof duration !== 'number' || duration <= 0) {
            console.log('Invalid duration:', duration);
            return res.status(400).json({ message: 'Duration must be a positive number.' });
        }

        // Create new activity
        const activity = new Activity({
            userId: req.user.userId,
            type,
            title,
            duration,
            xpEarned: duration // 1 XP per minute as base
        });

        // Save activity
        const savedActivity = await activity.save();
        console.log('Activity saved successfully:', savedActivity);
        console.log('Activity ID:', savedActivity._id);
        console.log('Activity createdAt:', savedActivity.createdAt);

        // Update user's stats
        const user = await User.findById(req.user.userId);
        if (!user) {
            console.log('User not found:', req.user.userId);
            return res.status(404).json({ message: 'User not found' });
        }

        // Update XP
        user.xp += activity.xpEarned;
        user.totalXP = (user.totalXP || 0) + activity.xpEarned;

        // Update type-specific stats
        if (type === 'WORKOUT') {
            user.stats = user.stats || {};
            user.stats.totalWorkouts = (user.stats.totalWorkouts || 0) + 1;
            user.stats.totalWorkMinutes = (user.stats.totalWorkMinutes || 0) + duration;
        }

        // Check for level up
        const xpForNextLevel = user.level * 100;
        let levelUp = null;
        if (user.xp >= xpForNextLevel) {
            user.level += 1;
            user.xp -= xpForNextLevel;
            levelUp = user.level;
            console.log('User leveled up!', { newLevel: user.level });
        }

        await user.save();
        console.log('User stats updated:', user);

        // Invalidate cache for this user
        invalidateCache.user(req.user.userId);
        invalidateCache.activities(req.user.userId);

        res.status(201).json({
            message: 'Activity added',
            activity,
            levelUp
        });
    } catch (err) {
        console.error('Error adding activity:', err);
        next(err);
    }
});

module.exports = router;
