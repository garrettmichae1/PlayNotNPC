class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('\n=== ERROR HANDLER START ===');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Request Path:', req.path);
    console.error('Request Method:', req.method);
    console.error('Request Headers:', req.headers);
    console.error('Request Body:', req.body);
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Stack:', err.stack);
    if (err.errors) {
        console.error('Validation Errors:', JSON.stringify(err.errors, null, 2));
    }
    console.error('=== ERROR HANDLER END ===\n');

    // Handle Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            status: 'error',
            message: 'Validation Error',
            details: messages
        });
    }

    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'error',
            message: `${field} already exists`,
            field: field,
            value: err.keyValue[field]
        });
    }

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const response = {
        status: err.status,
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            name: err.name,
            code: err.code,
            ...(err.errors && { validationErrors: err.errors })
        } : {}
    };

    res.status(err.statusCode).json(response);
};

module.exports = {
    AppError,
    errorHandler
};
