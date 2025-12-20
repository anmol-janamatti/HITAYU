const express = require('express');
const router = express.Router();
const { createTask, assignTask, getMyTasks, updateTaskStatus, getTasksByEvent } = require('../controllers/taskController');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// All routes require authentication
router.use(auth);

router.post('/', role('admin'), createTask);
router.put('/:id/assign', role('admin'), assignTask);
router.get('/my-tasks', role('volunteer'), getMyTasks);
router.put('/:id/status', role('volunteer'), updateTaskStatus);
router.get('/event/:eventId', getTasksByEvent);

module.exports = router;
