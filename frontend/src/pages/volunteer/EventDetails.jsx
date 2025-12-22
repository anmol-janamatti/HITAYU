import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import EventChat from '../../components/EventChat';
import { UPLOADS_URL } from '../../config';

const EventDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const response = await api.get(`/events/${id}`);
            setEvent(response.data);
        } catch (err) {
            setError('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        setJoining(true);
        try {
            await api.post(`/events/${id}/join`);
            fetchEvent();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to join event');
        } finally {
            setJoining(false);
        }
    };

    const isJoined = () => {
        return event?.volunteers?.some(v => v._id === user._id);
    };

    const isFull = () => {
        return event?.volunteers?.length >= event?.maxVolunteers;
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (error || !event) {
        return (
            <div className="p-8 text-center text-red-600">
                {error || 'Event not found'}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/volunteer" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to Events
            </Link>

            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{event.title}</h1>
                    {isJoined() ? (
                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm font-medium text-center">
                            ✓ You've Joined
                        </span>
                    ) : isFull() ? (
                        <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded text-sm font-medium text-center">
                            Event Full
                        </span>
                    ) : (
                        <button
                            onClick={handleJoin}
                            disabled={joining}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 w-full sm:w-auto"
                        >
                            {joining ? 'Joining...' : 'Join Event'}
                        </button>
                    )}
                </div>

                <p className="text-gray-600 mb-6">{event.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-6">
                    <div>
                        <span className="font-medium block text-gray-700">Date</span>
                        {new Date(event.date).toLocaleString()}
                    </div>
                    <div>
                        <span className="font-medium block text-gray-700">Location</span>
                        {event.location}
                    </div>
                    <div>
                        <span className="font-medium block text-gray-700">Organized By</span>
                        {event.createdBy?.name || 'Admin'}
                    </div>
                    <div>
                        <span className="font-medium block text-gray-700">Volunteers</span>
                        {event.volunteers?.length || 0} / {event.maxVolunteers}
                    </div>
                </div>

                {isJoined() && (
                    <div className="bg-blue-50 p-4 rounded">
                        <p className="text-blue-800 text-sm">
                            You've joined this event. Check your <Link to="/volunteer/tasks" className="underline font-medium">My Tasks</Link> page for assigned tasks.
                        </p>
                    </div>
                )}
            </div>

            {/* Event Photos Section */}
            {event.photos && event.photos.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Photos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {event.photos.map((photo, index) => (
                            <img
                                key={index}
                                src={`${UPLOADS_URL}/events/${photo}`}
                                alt={`Event photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                                onClick={() => window.open(`${UPLOADS_URL}/events/${photo}`, '_blank')}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Event Chat - only show if joined */}
            {isJoined() && (
                <div className="mb-6">
                    <EventChat eventId={id} />
                </div>
            )}
        </div>
    );
};

export default EventDetails;

