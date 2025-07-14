const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import middleware
const { errorHandler, notFound, asyncHandler } = require('./middleware/errorHandler');
const { securityHeaders, requestLogger, preventParameterPollution } = require('./middleware/security');

// Import database configuration
const { connectDB, checkDatabaseHealth } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(securityHeaders);
app.use(requestLogger);
app.use(preventParameterPollution);

// CORS configuration - More permissive for mobile testing
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.APP_URL || 'https://your-app-name.onrender.com'] 
        : ['http://localhost:3000', 'http://localhost:5000', 'http://192.168.1.185:5000', 'https://192.168.1.185:5000', '*'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mobile-friendly headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.header('Pragma', 'no-cache');
    res.header('Expires', '0');
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// Database connection is now handled by config/database.js

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/performance', require('./routes/performance'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/friends', require('./routes/friends'));

// Health check endpoint for monitoring
app.get('/health', async (req, res) => {
    try {
        const dbHealth = await checkDatabaseHealth();
        
        res.status(200).json({ 
            status: 'OK', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: dbHealth
        });
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: { status: 'error', error: error.message },
            error: 'Database health check failed'
        });
    }
});

// Serve main app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve mobile test page
app.get('/mobile-test-page', (req, res) => {
    res.sendFile(path.join(__dirname, 'mobile-test.html'));
});

// Mobile-friendly API endpoint for testing
app.get('/mobile-test', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'Mobile connection working!',
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']
    });
});

// 404 handler - must be before error handler
app.use(notFound);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown is now handled by config/database.js

// Start server
const startServer = async () => {
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`📱 Frontend available at: http://localhost:${PORT}`);
        console.log(`📱 Mobile access: http://192.168.1.185:${PORT}`);
        console.log(`🔗 API endpoints available at: http://localhost:${PORT}/api/`);
        console.log(`🔐 Login: http://localhost:${PORT}/login`);
        console.log(`🧪 Mobile test page: http://localhost:${PORT}/mobile-test-page`);
        console.log(`📱 Mobile testing tips:`);
        console.log(`   - Use Chrome/Edge on mobile for best compatibility`);
        console.log(`   - If you get SSL errors, try: https://192.168.1.185:${PORT}`);
        console.log(`   - Or disable "HTTPS only" in mobile browser settings`);
        console.log(`   - Test mobile optimizations at: http://192.168.1.185:${PORT}/mobile-test-page`);
        
        if (process.env.NODE_ENV === 'production') {
            console.log('✅ Production mode enabled');
        }
    });
};

startServer().catch(console.error);
