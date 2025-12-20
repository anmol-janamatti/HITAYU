import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await api.get('/events/my-events');
            setEvents(response.data);
        } catch (err) {
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
                <Link
                    to="/admin/events/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Create Event
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {events.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-600">No events created yet.</p>
                    <Link to="/admin/events/create" className="text-blue-600 hover:underline mt-2 inline-block">
                        Create your first event
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <Link
                            key={event._id}
                            to={`/admin/events/${event._id}`}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">{event.title}</h2>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                                <p>📍 {event.location}</p>
                                <p>👥 {event.volunteers?.length || 0} / {event.maxVolunteers} volunteers</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
