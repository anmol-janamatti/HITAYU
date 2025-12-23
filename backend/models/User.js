const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    role: {
        type: String,
        enum: ['admin', 'volunteer'],
        default: null
    },
    profileComplete: {
        type: Boolean,
        default: false
    },
    // Profile fields
    phone: {
        type: String,
        trim: true,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    location: {
        type: String,
        trim: true,
        default: null
    },
    avatar: {
        type: String,
        default: null
    },
    // Volunteer-specific fields
    skills: [{
        type: String
    }],
    availability: {
        type: String,
        enum: ['weekdays', 'weekends', 'both', 'flexible', null],
        default: null
    },
    // Admin-specific fields
    organization: {
        type: String,
        trim: true,
        default: null
    },
    position: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
