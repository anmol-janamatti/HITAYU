import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import EventChat from '../../components/EventChat';
import { UPLOADS_URL } from '../../config';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Edit event state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    // Task creation state
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [selectedVolunteers, setSelectedVolunteers] = useState([]);
    const [taskLoading, setTaskLoading] = useState(false);
    const [taskError, setTaskError] = useState('');

    useEffect(() => {
        fetchEventAndTasks();
    }, [id]);

    const fetchEventAndTasks = async () => {
        try {
            const [eventRes, tasksRes] = await Promise.all([
                api.get(`/events/${id}`),
                api.get(`/tasks/event/${id}`)
            ]);
            setEvent(eventRes.data);
            setTasks(tasksRes.data);
            setEditForm({
                title: eventRes.data.title,
                description: eventRes.data.description,
                date: eventRes.data.date?.split('T')[0],
                location: eventRes.data.location,
                maxVolunteers: eventRes.data.maxVolunteers
            });
        } catch (err) {
            setError('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        try {
            await api.put(`/events/${id}`, editForm);
            setShowEditModal(false);
            fetchEventAndTasks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update event');
        } finally {
            setEditLoading(false);
        }
    };

    const handleRemoveVolunteer = async (volunteerId) => {
        if (!confirm('Remove this volunteer from the event?')) return;
        try {
            await api.delete(`/events/${id}/volunteers/${volunteerId}`);
            fetchEventAndTasks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove volunteer');
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setTaskError('');
        setTaskLoading(true);

        try {
            await api.post('/tasks', {
                title: taskTitle,
                eventId: id,
                assignedTo: selectedVolunteers.length > 0 ? selectedVolunteers : undefined
            });
            setTaskTitle('');
            setSelectedVolunteers([]);
            setShowTaskForm(false);
            fetchEventAndTasks();
        } catch (err) {
            setTaskError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleAssignTask = async (taskId, volunteerIds) => {
        try {
            await api.put(`/tasks/${taskId}/assign`, { volunteerIds });
            fetchEventAndTasks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign task');
        }
    };

    const toggleVolunteerSelection = (volunteerId) => {
        setSelectedVolunteers(prev =>
            prev.includes(volunteerId)
                ? prev.filter(id => id !== volunteerId)
                : [...prev, volunteerId]
        );
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
            <Link to="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
                ← Back to Dashboard
            </Link>

            {/* Event Details Card */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{event.title}</h1>
                    <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm flex items-center gap-2"
                    >
                        ✏️ Edit Event
                    </button>
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{event.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-sm text-gray-500">
                    <div>
                        <span className="font-medium">Date:</span><br />
                        {new Date(event.date).toLocaleString()}
                    </div>
                    <div>
                        <span className="font-medium">Location:</span><br />
                        {event.location}
                    </div>
                    <div>
                        <span className="font-medium">Volunteers:</span><br />
                        {event.volunteers?.length || 0} / {event.maxVolunteers}
                    </div>
                </div>
            </div>

            {/* Edit Event Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Edit Event</h2>
                        <form onSubmit={handleUpdateEvent}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={editForm.title || ''}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Date</label>
                                <input
                                    type="date"
                                    value={editForm.date || ''}
                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Location</label>
                                <input
                                    type="text"
                                    value={editForm.location || ''}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Max Volunteers</label>
                                <input
                                    type="number"
                                    value={editForm.maxVolunteers || ''}
                                    onChange={(e) => setEditForm({ ...editForm, maxVolunteers: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                    min="1"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 py-2 border rounded-md hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {editLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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

            {/* Volunteers Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Volunteers</h2>
                {event.volunteers?.length === 0 ? (
                    <p className="text-gray-500">No volunteers have joined yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {event.volunteers?.map((volunteer) => (
                            <li key={volunteer._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                        {volunteer.username?.charAt(0).toUpperCase()}
                                    </span>
                                    <span>{volunteer.username}</span>
                                    <span className="text-gray-400 text-sm">({volunteer.email})</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveVolunteer(volunteer._id)}
                                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1 hover:bg-red-50 rounded"
                                    title="Remove volunteer"
                                >
                                    ✕ Remove
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Event Chat */}
            <div className="mb-6">
                <EventChat eventId={id} />
            </div>

            {/* Tasks Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Tasks</h2>
                    <button
                        onClick={() => setShowTaskForm(!showTaskForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    >
                        {showTaskForm ? 'Cancel' : 'Create Task'}
                    </button>
                </div>

                {showTaskForm && (
                    <form onSubmit={handleCreateTask} className="mb-6 p-4 bg-gray-50 rounded">
                        {taskError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
                                {taskError}
                            </div>
                        )}
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Task Title
                            </label>
                            <input
                                type="text"
                                value={taskTitle}
                                onChange={(e) => setTaskTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Assign To (Select multiple)
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {event.volunteers?.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No volunteers to assign</p>
                                ) : (
                                    event.volunteers?.map((volunteer) => (
                                        <button
                                            key={volunteer._id}
                                            type="button"
                                            onClick={() => toggleVolunteerSelection(volunteer._id)}
                                            className={`px-3 py-1 rounded-full text-sm border transition-colors ${selectedVolunteers.includes(volunteer._id)
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                                }`}
                                        >
                                            {selectedVolunteers.includes(volunteer._id) ? '✓ ' : ''}{volunteer.username}
                                        </button>
                                    ))
                                )}
                            </div>
                            {selectedVolunteers.length > 0 && (
                                <p className="text-sm text-blue-600 mt-2">
                                    {selectedVolunteers.length} volunteer(s) selected
                                </p>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={taskLoading}
                            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            {taskLoading ? 'Creating...' : 'Create Task'}
                        </button>
                    </form>
                )}

                {tasks.length === 0 ? (
                    <p className="text-gray-500">No tasks created yet.</p>
                ) : (
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <div key={task._id} className="p-3 bg-gray-50 rounded">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium text-gray-800">{task.title}</p>
                                        <p className="text-sm text-gray-500">
                                            Status: <span className={`font-medium ${task.status === 'completed' ? 'text-green-600' :
                                                task.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-600'
                                                }`}>{task.status}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    {task.assignedTo?.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-sm text-gray-500">Assigned to:</span>
                                            {task.assignedTo.map((v) => (
                                                <span key={v._id} className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                    {v.username}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-sm text-gray-400">Unassigned - </span>
                                            {event.volunteers?.map((volunteer) => (
                                                <button
                                                    key={volunteer._id}
                                                    onClick={() => handleAssignTask(task._id, [volunteer._id])}
                                                    className="text-xs bg-gray-200 hover:bg-blue-100 text-gray-700 px-2 py-1 rounded"
                                                >
                                                    + {volunteer.username}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventDetails;
