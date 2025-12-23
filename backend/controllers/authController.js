const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, picture } = payload;

        // Find existing user by googleId or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        let isNewUser = false;

        if (user) {
            // Update googleId if user exists by email but doesn't have googleId
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // Create new user
            user = await User.create({
                googleId,
                email,
                avatar: picture || null,
                profileComplete: false
            });
            isNewUser = true;
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Response
        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            profileComplete: user.profileComplete,
            avatar: user.avatar,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            availability: user.availability,
            organization: user.organization,
            position: user.position,
            token,
            isNewUser
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

// @desc    Complete user profile
// @route   PUT /api/auth/complete-profile
// @access  Private
const completeProfile = async (req, res) => {
    try {
        const { username, role, phone, bio, location, skills, availability, organization, position } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Validate required fields
        if (!username || username.length < 3 || username.length > 20) {
            return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({ message: 'Username can only contain letters, numbers and underscores' });
        }

        if (!['admin', 'volunteer'].includes(role)) {
            return res.status(400).json({ message: 'Role must be admin or volunteer' });
        }

        // Check if username is taken (by another user)
        const existingUser = await User.findOne({
            username: username.toLowerCase(),
            _id: { $ne: user._id }
        });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Update user
        user.username = username.toLowerCase();
        user.role = role;
        user.profileComplete = true;

        // Optional fields
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;

        // Role-specific fields
        if (role === 'volunteer') {
            if (skills !== undefined) user.skills = skills;
            if (availability !== undefined) user.availability = availability;
        } else if (role === 'admin') {
            if (organization !== undefined) user.organization = organization;
            if (position !== undefined) user.position = position;
        }

        await user.save();

        // Generate new token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            profileComplete: user.profileComplete,
            avatar: user.avatar,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            availability: user.availability,
            organization: user.organization,
            position: user.position,
            token
        });
    } catch (error) {
        console.error('Complete profile error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { googleAuth, completeProfile, getMe };
