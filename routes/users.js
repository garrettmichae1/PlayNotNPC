const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/errorHandler');
const auth = require('../middleware/auth');
const { userQueries, invalidateCache } = require('../services/queryOptimizer');

// Debug middleware for user routes
router.use((req, res, next) => {
    console.log('\n=== USER ROUTE REQUEST START ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Path:', req.path);
    console.log('Method:', req.method);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    console.log('=== USER ROUTE REQUEST END ===\n');
    next();
});

// Register User
router.post('/register', async (req, res, next) => {
    try {
        console.log('\n=== REGISTRATION ATTEMPT START ===');
        console.log('Registration payload:', req.body);
        
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            console.log('Missing required fields:', { email: !!email, password: !!password });
            throw new AppError('Email and password are required', 400);
        }

        console.log('Checking for existing user...');
        // Check if email exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists with email:', email);
            throw new AppError('Email already registered', 400);
        }

        // Generate username from email
        let username = email.split('@')[0];
        console.log('Generated initial username:', username);

        // Check if username exists
        user = await User.findOne({ username });
        if (user) {
            const randomNum = Math.floor(Math.random() * 1000);
            username = `${username}${randomNum}`;
            console.log('Username exists, generated new username:', username);
        }

        console.log('Creating new user with username:', username);
        // Create new user
        user = new User({ 
            email, 
            password, // Will be hashed by the pre-save middleware
            username
        });
        
        console.log('Saving user to database...');
        await user.save();
        console.log('User saved successfully!');

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        console.log('JWT token generated successfully');
        console.log('=== REGISTRATION ATTEMPT END ===\n');
        
        res.status(201).json({ 
            status: 'success',
            token, 
            username,
            message: 'Registration successful' 
        });
    } catch (err) {
        console.error('\n=== REGISTRATION ERROR ===');
        console.error('Error details:', {
            name: err.name,
            message: err.message,
            code: err.code,
            stack: err.stack
        });
        console.error('=== REGISTRATION ERROR END ===\n');
        next(err);
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Get user stats and send them with login response
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
        res.json({ 
            token,
            username: user.username,
            stats: {
                level: user.level,
                xp: user.xp
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User Stats (protected) - using optimized query with caching
router.get('/stats', auth, async (req, res) => {
    try {
        const userStats = await userQueries.getUserStats(req.user.userId);
        res.json({ 
            level: userStats.level, 
            xp: userStats.xp, 
            streakCount: userStats.streakCount || 0 
        });
    } catch (err) {
        console.error('Error fetching user stats:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
