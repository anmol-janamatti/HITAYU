const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const Message = require('./models/Message');
const User = require('./models/User');
const { isEventMember } = require('./controllers/messageController');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Socket.IO JWT authentication middleware
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = user;
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    // Join event room
    socket.on('join-event', async (eventId) => {
        try {
            const isMember = await isEventMember(socket.user._id, eventId);
            if (isMember) {
                socket.join(`event-${eventId}`);
                console.log(`${socket.user.username} joined event room: ${eventId}`);
            }
        } catch (error) {
            console.error('Error joining event room:', error);
        }
    });

    // Leave event room
    socket.on('leave-event', (eventId) => {
        socket.leave(`event-${eventId}`);
        console.log(`${socket.user.username} left event room: ${eventId}`);
    });

    // Send message
    socket.on('send-message', async (data) => {
        try {
            const { eventId, content } = data;

            const isMember = await isEventMember(socket.user._id, eventId);
            if (!isMember) {
                socket.emit('error', { message: 'Not authorized' });
                return;
            }

            const message = await Message.create({
                eventId,
                sender: socket.user._id,
                content: content.trim()
            });

            const populatedMessage = await Message.findById(message._id)
                .populate('sender', 'username email');

            // Broadcast to all users in the event room
            io.to(`event-${eventId}`).emit('new-message', populatedMessage);
        } catch (error) {
            console.error('Error sending message:', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
});

// Middleware
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL, process.env.FRONTEND_URL?.replace('https://', 'http://')]
        : '*',
    credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());

// Note: Images are now served from Cloudinary CDN, no local static serving needed

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/events', require('./routes/messageRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'NGO Volunteer Portal API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

