const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { activityQueries, invalidateCache } = require('../services/queryOptimizer');

// Helper function to calculate user progress for a challenge
async function calculateUserProgress(userId, challenge) {
    const startDate = challenge.startDate;
    const endDate = challenge.endDate;

    // Get user's activities during the challenge period
    const activities = await Activity.find({
        userId: userId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    let score = 0;
    let progress = 0;

    switch (challenge.type) {
        case 'workouts':
            const workoutCount = activities.filter(a => a.type === 'WORKOUT').length;
            score = workoutCount;
            progress = Math.min((workoutCount / 20) * 100, 100); // Assume 20 workouts is 100%
            break;

        case 'study_hours':
            const studyActivities = activities.filter(a => a.type === 'STUDY');
            const studyHours = studyActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
            score = studyHours;
            progress = Math.min((studyHours / 50) * 100, 100); // Assume 50 hours is 100%
            break;

        case 'work_hours':
            const workActivities = activities.filter(a => a.type === 'WORK');
            const workHours = workActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
            score = workHours;
            progress = Math.min((workHours / 80) * 100, 100); // Assume 80 hours is 100%
            break;

        case 'xp_earned':
            const totalXP = activities.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
            score = totalXP;
            progress = Math.min((totalXP / 1000) * 100, 100); // Assume 1000 XP is 100%
            break;

        case 'streak':
            // Calculate current streak during challenge period
            const streak = calculateStreak(activities);
            score = streak;
            progress = Math.min((streak / 10) * 100, 100); // Assume 10 days is 100%
            break;

        case 'variety':
            const categories = new Set(activities.map(a => a.type));
            score = categories.size;
            progress = Math.min((categories.size / 3) * 100, 100); // 3 categories = 100%
            break;

        default:
            score = 0;
            progress = 0;
    }

    return { score, progress };
}

// Helper function to calculate streak
function calculateStreak(activities) {
    if (activities.length === 0) return 0;

    const sortedActivities = activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedActivities.length; i++) {
        const prevDate = new Date(sortedActivities[i - 1].createdAt);
        const currDate = new Date(sortedActivities[i].createdAt);
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

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

        // Update challenge progress for active challenges
        try {
            const Challenge = require('../models/Challenge');
            const activeChallenges = await Challenge.find({
                participants: req.user.userId,
                status: 'active',
                endDate: { $gt: new Date() }
            });

            for (const challenge of activeChallenges) {
                // Calculate user's progress based on challenge type
                const progress = await calculateUserProgress(req.user.userId, challenge);
                
                // Update or create participant result
                const existingResult = challenge.participantResults.find(
                    result => result.userId.equals(req.user.userId)
                );

                if (existingResult) {
                    existingResult.score = progress.score;
                    existingResult.progress = progress.progress;
                    existingResult.lastUpdated = new Date();
                } else {
                    challenge.participantResults.push({
                        userId: req.user.userId,
                        score: progress.score,
                        progress: progress.progress,
                        lastUpdated: new Date()
                    });
                }

                await challenge.save();
            }
        } catch (challengeError) {
            console.error('Error updating challenge progress:', challengeError);
            // Don't fail the activity creation if challenge update fails
        }

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
