const express = require('express');
const router = express.Router();
const { createEvent, getAllEvents, getEventById, joinEvent, getMyEvents } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require authentication
router.use(auth);

router.post('/', role('admin'), createEvent);
router.get('/', getAllEvents);
router.get('/my-events', role('admin'), getMyEvents);
router.get('/:id', getEventById);
router.post('/:id/join', role('volunteer'), joinEvent);

module.exports = router;
