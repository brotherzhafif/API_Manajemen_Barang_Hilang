const { auth } = require('../config/firebase');

// Middleware verifikasi token
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized - Token diperlukan' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;

        next();
    } catch (error) {
        console.error('Error verifikasi token:', error);
        res.status(401).json({ error: 'Unauthorized - Token tidak valid' });
    }
};

// Middleware pengecekan role
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden - Anda tidak memiliki akses' });
        }

        next();
    };
};

module.exports = { verifyToken, checkRole };