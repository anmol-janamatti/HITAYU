const express = require('express');
const router = express.Router();
const { createEvent, updateEvent, removeVolunteer, getAllEvents, getEventById, joinEvent, getMyEvents } = require('../controllers/eventController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const upload = require('../middleware/uploadMiddleware');

// Public route - no auth required (for landing page)
router.get('/public', getAllEvents);

// Protected routes - require authentication
router.use(auth);

router.post('/', role('admin'), upload.array('photos', 10), createEvent);
router.get('/', getAllEvents);
router.get('/my-events', role('admin'), getMyEvents);
router.get('/:id', getEventById);
router.put('/:id', role('admin'), updateEvent);
router.post('/:id/join', role('volunteer'), joinEvent);
router.delete('/:id/volunteers/:volunteerId', role('admin'), removeVolunteer);

module.exports = router;


