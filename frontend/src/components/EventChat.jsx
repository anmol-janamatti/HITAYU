import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const EventChat = ({ eventId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Fetch initial messages
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/events/${eventId}/messages`);
                setMessages(response.data);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Setup Socket.IO connection
        const token = localStorage.getItem('token');
        socketRef.current = io(API_BASE_URL, {
            auth: { token }
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to socket');
            socketRef.current.emit('join-event', eventId);
        });

        socketRef.current.on('new-message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        socketRef.current.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave-event', eventId);
                socketRef.current.disconnect();
            }
        };
    }, [eventId]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Prevent body scroll when fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isFullscreen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            socketRef.current.emit('send-message', {
                eventId,
                content: newMessage.trim()
            });
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                Loading chat...
            </div>
        );
    }

    const chatContent = (
        <>
            {/* Header */}
            <div className={`p-4 border-b border-gray-200 flex justify-between items-center ${isFullscreen ? 'bg-blue-600 text-white' : ''}`}>
                <div>
                    <h3 className={`font-semibold ${isFullscreen ? 'text-white' : 'text-gray-800'}`}>
                        💬 Event Chat
                    </h3>
                    <p className={`text-sm ${isFullscreen ? 'text-blue-100' : 'text-gray-500'}`}>
                        Only event members can see this chat
                    </p>
                </div>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`p-2 rounded-lg transition-colors ${isFullscreen
                        ? 'hover:bg-blue-500 text-white'
                        : 'hover:bg-gray-100 text-gray-600'
                        }`}
                    title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {isFullscreen ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Messages Container */}
            <div className={`overflow-y-auto p-4 space-y-3 ${isFullscreen ? 'flex-1' : 'h-64'}`}>
                {messages.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm">
                        No messages yet. Start the conversation!
                    </p>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender._id === user._id
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                                    }`}
                            >
                                <p className={`text-xs mb-1 ${msg.sender._id === user._id ? 'text-blue-200' : 'text-gray-500'
                                    }`}>
                                    {msg.sender.username}
                                </p>
                                <p className={`${isFullscreen ? 'text-base' : 'text-sm'}`}>{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t border-gray-200 ${isFullscreen ? 'bg-gray-50' : ''}`}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className={`flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${isFullscreen ? 'text-base' : ''}`}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className={`px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 ${isFullscreen ? 'text-base' : ''}`}
                    >
                        {sending ? '...' : 'Send'}
                    </button>
                </div>
            </form>
        </>
    );

    // Fullscreen mode
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col">
                {chatContent}
            </div>
        );
    }

    // Normal mode
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200">
            {chatContent}
        </div>
    );
};

export default EventChat;
