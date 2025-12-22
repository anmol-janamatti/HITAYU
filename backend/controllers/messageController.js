const Message = require('../models/Message');
const Event = require('../models/Event');

// Check if user is member of event (admin who created it or volunteer who joined)
const isEventMember = async (userId, eventId) => {
    const event = await Event.findById(eventId);
    if (!event) return false;

    // Check if user is the admin who created the event
    if (event.createdBy.toString() === userId.toString()) return true;

    // Check if user is a volunteer who joined
    return event.volunteers.some(v => v.toString() === userId.toString());
};

// @desc    Get messages for an event
// @route   GET /api/events/:id/messages
// @access  Private (event members only)
const getMessages = async (req, res) => {
    try {
        const eventId = req.params.id;

        // Check membership
        const isMember = await isEventMember(req.user._id, eventId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this event' });
        }

        const messages = await Message.find({ eventId })
            .populate('sender', 'username email')
            .sort({ createdAt: 1 })
            .limit(100);

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send message to event chat
// @route   POST /api/events/:id/messages
// @access  Private (event members only)
const createMessage = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { content } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Check membership
        const isMember = await isEventMember(req.user._id, eventId);
        if (!isMember) {
            return res.status(403).json({ message: 'You are not a member of this event' });
        }

        const message = await Message.create({
            eventId,
            sender: req.user._id,
            content: content.trim()
        });

        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'username email');

        res.status(201).json(populatedMessage);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getMessages, createMessage, isEventMember };
