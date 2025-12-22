const express = require('express');
const router = express.Router();
const { getMessages, createMessage } = require('../controllers/messageController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

router.get('/:id/messages', getMessages);
router.post('/:id/messages', createMessage);

module.exports = router;
