const express = require('express');
const router = express.Router();
const { register, login, googleAuth, updateRole, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.put('/role', updateRole);
router.get('/me', auth, getMe);

module.exports = router;

