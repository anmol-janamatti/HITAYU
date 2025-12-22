const Task = require('../models/Task');
const Event = require('../models/Event');

// @desc    Create task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
    try {
        const { title, eventId, assignedTo } = req.body;

        // Verify event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Handle assignedTo as array or single value
        let volunteerIds = [];
        if (assignedTo) {
            volunteerIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];

            // Verify all volunteers are in the event
            for (const volunteerId of volunteerIds) {
                const volunteerInEvent = event.volunteers.some(
                    v => v.toString() === volunteerId
                );
                if (!volunteerInEvent) {
                    return res.status(400).json({ message: `Volunteer ${volunteerId} is not part of this event` });
                }
            }
        }

        const task = await Task.create({
            title,
            eventId,
            assignedTo: volunteerIds,
            status: 'pending'
        });

        const populatedTask = await Task.findById(task._id)
            .populate('eventId', 'title')
            .populate('assignedTo', 'username email');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Assign task to volunteers
// @route   PUT /api/tasks/:id/assign
// @access  Private/Admin
const assignTask = async (req, res) => {
    try {
        const { volunteerIds } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify event and volunteers
        const event = await Event.findById(task.eventId);
        const ids = Array.isArray(volunteerIds) ? volunteerIds : [volunteerIds];

        for (const volunteerId of ids) {
            const volunteerInEvent = event.volunteers.some(
                v => v.toString() === volunteerId
            );
            if (!volunteerInEvent) {
                return res.status(400).json({ message: 'Volunteer is not part of this event' });
            }
        }

        task.assignedTo = ids;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('eventId', 'title')
            .populate('assignedTo', 'username email');

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get my assigned tasks (volunteer)
// @route   GET /api/tasks/my-tasks
// @access  Private/Volunteer
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ assignedTo: req.user._id })
            .populate('eventId', 'title date location')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private/Volunteer
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify the volunteer is assigned to this task
        const isAssigned = task.assignedTo.some(
            id => id.toString() === req.user._id.toString()
        );
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not assigned to this task' });
        }

        // Validate status
        if (!['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        task.status = status;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('eventId', 'title date location')
            .populate('assignedTo', 'username email');

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get tasks for an event
// @route   GET /api/tasks/event/:eventId
// @access  Private
const getTasksByEvent = async (req, res) => {
    try {
        const tasks = await Task.find({ eventId: req.params.eventId })
            .populate('assignedTo', 'username email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createTask, assignTask, getMyTasks, updateTaskStatus, getTasksByEvent };

