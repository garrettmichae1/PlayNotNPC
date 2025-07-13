/**
 * Input Validation Middleware
 * Validates user inputs using express-validator
 */

const { body, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg).join(', ');
        return next(new AppError(errorMessages, 400));
    }
    next();
};

// User registration validation
const validateRegistration = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    handleValidationErrors
];

// User login validation
const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

// Activity creation validation
const validateActivity = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Activity title must be between 1 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Activity description cannot exceed 500 characters'),
    body('category')
        .isIn(['workout', 'study', 'reading', 'meditation', 'custom'])
        .withMessage('Invalid activity category'),
    body('xp')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('XP must be between 1 and 1000'),
    handleValidationErrors
];

// Activity update validation
const validateActivityUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Activity title must be between 1 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Activity description cannot exceed 500 characters'),
    body('category')
        .optional()
        .isIn(['workout', 'study', 'reading', 'meditation', 'custom'])
        .withMessage('Invalid activity category'),
    body('xp')
        .optional()
        .isInt({ min: 1, max: 1000 })
        .withMessage('XP must be between 1 and 1000'),
    handleValidationErrors
];

// Sanitize inputs to prevent XSS
const sanitizeInputs = [
    body('*').trim().escape(),
    (req, res, next) => {
        // Remove any script tags that might have been missed
        const sanitize = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        };
        sanitize(req.body);
        next();
    }
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateActivity,
    validateActivityUpdate,
    sanitizeInputs,
    handleValidationErrors
}; 