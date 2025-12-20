const Event = require('../models/Event');

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, maxVolunteers } = req.body;

        const event = await Event.create({
            title,
            description,
            date,
            location,
            maxVolunteers,
            createdBy: req.user._id,
            volunteers: []
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name email')
            .populate('volunteers', 'name email')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('volunteers', 'name email');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Join event (volunteer only)
// @route   POST /api/events/:id/join
// @access  Private/Volunteer
const joinEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already joined
        if (event.volunteers.includes(req.user._id)) {
            return res.status(400).json({ message: 'You have already joined this event' });
        }

        // Check if max volunteers reached
        if (event.volunteers.length >= event.maxVolunteers) {
            return res.status(400).json({ message: 'Event has reached maximum volunteers' });
        }

        event.volunteers.push(req.user._id);
        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('volunteers', 'name email');

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get events created by admin
// @route   GET /api/events/my-events
// @access  Private/Admin
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user._id })
            .populate('volunteers', 'name email')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createEvent, getAllEvents, getEventById, joinEvent, getMyEvents };
