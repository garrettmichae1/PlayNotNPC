const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Accept both 'Authorization' and 'x-auth-token' headers
    let token = req.header('x-auth-token');
    if (!token && req.headers.authorization) {
        // Support 'Bearer <token>'
        const parts = req.headers.authorization.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
            token = parts[1];
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        console.log('Auth middleware - User decoded:', req.user);
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};
