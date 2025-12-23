import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { getImageUrl } from '../../config';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events');
            setEvents(response.data);
        } catch (err) {
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (eventId) => {
        try {
            await api.post(`/events/${eventId}/join`);
            fetchEvents();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join event');
        }
    };

    const isJoined = (event) => {
        return event.volunteers?.some(v => v._id === user._id);
    };

    const isFull = (event) => {
        return event.volunteers?.length >= event.maxVolunteers;
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Events</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {events.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-600">No events available at the moment.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div
                            key={event._id}
                            className="bg-white rounded-lg shadow overflow-hidden"
                        >
                            {/* Event Cover Photo */}
                            {event.photos && event.photos.length > 0 ? (
                                <img
                                    src={getImageUrl(event.photos[0])}
                                    alt={event.title}
                                    className="w-full h-40 object-cover"
                                />
                            ) : (
                                <div className="w-full h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-white text-4xl">📅</span>
                                </div>
                            )}
                            <div className="p-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h2>
                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{event.description}</p>
                                <div className="text-sm text-gray-500 space-y-1 mb-4">
                                    <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                    <p>📍 {event.location}</p>
                                    <p>👥 {event.volunteers?.length || 0} / {event.maxVolunteers} volunteers</p>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/volunteer/events/${event._id}`}
                                        className="flex-1 text-center bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 text-sm"
                                    >
                                        View Details
                                    </Link>
                                    {isJoined(event) ? (
                                        <span className="flex-1 text-center bg-green-100 text-green-700 px-4 py-2 rounded text-sm">
                                            ✓ Joined
                                        </span>
                                    ) : isFull(event) ? (
                                        <span className="flex-1 text-center bg-gray-100 text-gray-500 px-4 py-2 rounded text-sm">
                                            Full
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(event._id)}
                                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                                        >
                                            Join
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventList;
