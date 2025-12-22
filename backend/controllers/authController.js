const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const {
            username, email, password, role,
            phone, bio, location,
            skills, availability,  // volunteer
            organization, position  // admin
        } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Check if username exists
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Validate role
        if (!['admin', 'volunteer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be admin or volunteer' });
        }

        // Create user with profile fields
        const userData = {
            username,
            email,
            password,
            role,
            authProvider: 'local',
            phone: phone || null,
            bio: bio || null,
            location: location || null
        };

        // Add role-specific fields
        if (role === 'volunteer') {
            userData.skills = skills || [];
            userData.availability = availability || null;
        } else if (role === 'admin') {
            userData.organization = organization || null;
            userData.position = position || null;
        }

        const user = await User.create(userData);

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            availability: user.availability,
            organization: user.organization,
            position: user.position,
            avatar: user.avatar,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check if user is Google-only
        if (user.authProvider === 'google' && !user.password) {
            return res.status(401).json({ message: 'Please login with Google' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            availability: user.availability,
            organization: user.organization,
            position: user.position,
            avatar: user.avatar,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    try {
        const { credential, role } = req.body;

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name } = payload;

        // Check if user exists
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // Existing user - update googleId if needed
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            // New user - create account
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: 'google',
                role: role || null // Role may be set later
            });
        }

        // Check if role is set
        if (!user.role) {
            // Return user info but flag that role selection is needed
            return res.json({
                _id: user._id,
                name: user.username,
                email: user.email,
                needsRole: true
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            token
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Google authentication failed', error: error.message });
    }
};

// @desc    Update user role (for new Google users)
// @route   PUT /api/auth/role
// @access  Public (but requires user ID)
const updateRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['admin', 'volunteer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role) {
            return res.status(400).json({ message: 'Role already set' });
        }

        user.role = role;
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            _id: user._id,
            name: user.username,
            email: user.email,
            role: user.role,
            authProvider: user.authProvider,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, googleAuth, updateRole, getMe };

