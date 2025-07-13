/**
 * Comprehensive Error Handling Middleware
 * Handles all types of errors and provides consistent error responses
 */

// Custom error class for application-specific errors
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error Details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `Duplicate field value: ${field}. Please use another value.`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired. Please log in again.';
        error = new AppError(message, 401);
    }

    // Default error response
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Development error response (with stack trace)
    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            success: false,
            error: {
                message,
                statusCode,
                stack: err.stack
            }
        });
    } else {
        // Production error response (no stack trace)
        res.status(statusCode).json({
            success: false,
            error: {
                message: statusCode === 500 ? 'Internal Server Error' : message,
                statusCode
            }
        });
    }
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
    const error = new AppError(`Route ${req.originalUrl} not found`, 404);
    next(error);
};

// Async error wrapper to catch async errors
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    AppError,
    errorHandler,
    notFound,
    asyncHandler
}; 