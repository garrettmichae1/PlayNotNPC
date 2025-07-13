const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const User = require('../models/User.js');
const Activity = require('../models/Activity.js');

// Get user achievements
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user activities for achievement calculation
        const activities = await Activity.find({ userId: req.user.userId })
            .sort({ createdAt: -1 });

        // Calculate achievements (this would be done by the frontend AchievementManager)
        // For now, we'll return a basic structure
        const achievements = {
            unlocked: user.unlockedAchievements || [],
            totalCount: 30, // Total number of achievements available (20 original + 10 new)
            lastChecked: user.lastAchievementCheck || new Date()
        };

        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user achievements (when new achievements are unlocked)
router.post('/unlock', auth, async (req, res) => {
    try {
        const { achievementId, xpReward } = req.body;
        
        if (!achievementId) {
            return res.status(400).json({ message: 'Achievement ID is required' });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize unlockedAchievements array if it doesn't exist
        if (!user.unlockedAchievements) {
            user.unlockedAchievements = [];
        }

        // Check if achievement is already unlocked
        if (user.unlockedAchievements.includes(achievementId)) {
            return res.status(400).json({ message: 'Achievement already unlocked' });
        }

        // Add achievement to unlocked list
        user.unlockedAchievements.push(achievementId);
        
        // Add XP reward if provided
        if (xpReward && typeof xpReward === 'number') {
            user.xp += xpReward;
            
            // Check for level up
            const newLevel = Math.floor(user.xp / 100) + 1;
            if (newLevel > user.level) {
                user.level = newLevel;
            }
        }

        // Update last achievement check time
        user.lastAchievementCheck = new Date();

        await user.save();

        res.json({
            message: 'Achievement unlocked successfully',
            achievementId,
            xpReward: xpReward || 0,
            newLevel: user.level,
            newXp: user.xp
        });

    } catch (error) {
        console.error('Error unlocking achievement:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get achievement progress for a specific user
router.get('/progress', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get user activities for progress calculation
        const activities = await Activity.find({ userId: req.user.userId });

        // Calculate basic progress metrics
        const progress = {
            level: user.level,
            xp: user.xp,
            streakCount: user.streakCount || 0,
            totalActivities: activities.length,
            workoutCount: activities.filter(a => a.type === 'WORKOUT').length,
            studyCount: activities.filter(a => a.type === 'STUDY').length,
            workCount: activities.filter(a => a.type === 'WORK').length,
            totalWorkoutTime: activities
                .filter(a => a.type === 'WORKOUT')
                .reduce((sum, a) => sum + (a.duration || 0), 0),
            totalStudyTime: activities
                .filter(a => a.type === 'STUDY')
                .reduce((sum, a) => sum + (a.duration || 0), 0),
            totalWorkTime: activities
                .filter(a => a.type === 'WORK')
                .reduce((sum, a) => sum + (a.duration || 0), 0),
            unlockedAchievements: user.unlockedAchievements || []
        };

        res.json(progress);
    } catch (error) {
        console.error('Error fetching achievement progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset achievements (for testing purposes)
router.delete('/reset', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.unlockedAchievements = [];
        user.lastAchievementCheck = new Date();
        await user.save();

        res.json({ message: 'Achievements reset successfully' });
    } catch (error) {
        console.error('Error resetting achievements:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 