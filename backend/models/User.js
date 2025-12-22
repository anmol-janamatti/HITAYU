const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    },
    role: {
        type: String,
        enum: ['admin', 'volunteer'],
        default: null
    },
    // Profile fields - Common
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
        enum: ['weekdays', 'weekends', 'both', 'flexible'],
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

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.password || !this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

