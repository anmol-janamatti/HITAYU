const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

// All routes require authentication
router.use(auth);

router.get('/', getProfile);
router.put('/', upload.single('avatar'), updateProfile);

module.exports = router;
