/**
 * Security Middleware
 * Implements rate limiting and security headers
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many authentication attempts, please try again later.',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for general API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later.',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for activity creation
const activityLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 activity creations per minute
    message: {
        success: false,
        error: {
            message: 'Too many activity submissions, please slow down.',
            statusCode: 429
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Security headers configuration
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.APP_URL || 'https://yourdomain.com'] // Replace with your actual domain
        : ['http://localhost:5000', 'http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
};

// Prevent parameter pollution
const preventParameterPollution = (req, res, next) => {
    // Convert arrays to single values for query parameters
    for (let key in req.query) {
        if (Array.isArray(req.query[key])) {
            req.query[key] = req.query[key][0];
        }
    }
    next();
};

module.exports = {
    authLimiter,
    apiLimiter,
    activityLimiter,
    securityHeaders,
    corsOptions,
    requestLogger,
    preventParameterPollution
}; 