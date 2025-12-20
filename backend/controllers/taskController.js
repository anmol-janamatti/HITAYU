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

        // If assignedTo is provided, verify volunteer is in the event
        if (assignedTo) {
            const volunteerInEvent = event.volunteers.some(
                v => v.toString() === assignedTo
            );
            if (!volunteerInEvent) {
                return res.status(400).json({ message: 'Volunteer is not part of this event' });
            }
        }

        const task = await Task.create({
            title,
            eventId,
            assignedTo: assignedTo || null,
            status: 'pending'
        });

        const populatedTask = await Task.findById(task._id)
            .populate('eventId', 'title')
            .populate('assignedTo', 'name email');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Assign task to volunteer
// @route   PUT /api/tasks/:id/assign
// @access  Private/Admin
const assignTask = async (req, res) => {
    try {
        const { volunteerId } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify volunteer is in the event
        const event = await Event.findById(task.eventId);
        const volunteerInEvent = event.volunteers.some(
            v => v.toString() === volunteerId
        );

        if (!volunteerInEvent) {
            return res.status(400).json({ message: 'Volunteer is not part of this event' });
        }

        task.assignedTo = volunteerId;
        await task.save();

        const updatedTask = await Task.findById(task._id)
            .populate('eventId', 'title')
            .populate('assignedTo', 'name email');

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
        if (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString()) {
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
            .populate('assignedTo', 'name email');

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
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createTask, assignTask, getMyTasks, updateTaskStatus, getTasksByEvent };
