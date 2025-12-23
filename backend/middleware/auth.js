const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic auth middleware - verifies JWT
const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Middleware to require complete profile
const requireCompleteProfile = (req, res, next) => {
    if (!req.user.profileComplete) {
        return res.status(403).json({
            message: 'Profile incomplete',
            profileComplete: false
        });
    }
    next();
};

module.exports = auth;
module.exports.requireCompleteProfile = requireCompleteProfile;
