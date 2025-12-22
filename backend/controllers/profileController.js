const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { phone, bio, location, skills, availability, organization, position } = req.body;

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update common fields (username is immutable after registration)
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (location !== undefined) user.location = location;

        // Update role-specific fields
        if (user.role === 'volunteer') {
            if (skills !== undefined) user.skills = skills;
            if (availability !== undefined) user.availability = availability;
        } else if (user.role === 'admin') {
            if (organization !== undefined) user.organization = organization;
            if (position !== undefined) user.position = position;
        }

        // Handle avatar if uploaded
        if (req.file) {
            user.avatar = req.file.filename;
        }

        await user.save();

        res.json({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            phone: user.phone,
            bio: user.bio,
            location: user.location,
            skills: user.skills,
            availability: user.availability,
            organization: user.organization,
            position: user.position,
            avatar: user.avatar
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getProfile, updateProfile };

