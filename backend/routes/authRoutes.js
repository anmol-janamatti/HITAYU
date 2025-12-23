const express = require('express');
const router = express.Router();
const { googleAuth, completeProfile, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Google OAuth - login/signup
router.post('/google', googleAuth);

// Complete profile (for new users)
router.put('/complete-profile', auth, completeProfile);

// Get current user
router.get('/me', auth, getMe);

module.exports = router;
