const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.headers['x-access-token'];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { authenticate, requireAdmin };
