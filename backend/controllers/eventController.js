const Event = require('../models/Event');

// @desc    Create event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { title, description, date, location, maxVolunteers } = req.body;

        // Get photo filenames from uploaded files
        const photos = req.files ? req.files.map(file => file.filename) : [];

        const event = await Event.create({
            title,
            description,
            date,
            location,
            maxVolunteers,
            createdBy: req.user._id,
            volunteers: [],
            photos
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const { title, description, date, location, maxVolunteers } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Verify admin owns this event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this event' });
        }

        // Update fields
        if (title) event.title = title;
        if (description) event.description = description;
        if (date) event.date = date;
        if (location) event.location = location;
        if (maxVolunteers) event.maxVolunteers = maxVolunteers;

        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('volunteers', 'username email');

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Remove volunteer from event
// @route   DELETE /api/events/:id/volunteers/:volunteerId
// @access  Private/Admin
const removeVolunteer = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Verify admin owns this event
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Remove volunteer
        event.volunteers = event.volunteers.filter(
            v => v.toString() !== req.params.volunteerId
        );

        await event.save();

        const updatedEvent = await Event.findById(req.params.id)
            .populate('createdBy', 'username email')
            .populate('volunteers', 'username email');

        res.json(updatedEvent);
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
            .populate('createdBy', 'username email')
            .populate('volunteers', 'username email')
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
            .populate('createdBy', 'username email')
            .populate('volunteers', 'username email');

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
            .populate('createdBy', 'username email')
            .populate('volunteers', 'username email');

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
            .populate('volunteers', 'username email')
            .sort({ date: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { createEvent, updateEvent, removeVolunteer, getAllEvents, getEventById, joinEvent, getMyEvents };

