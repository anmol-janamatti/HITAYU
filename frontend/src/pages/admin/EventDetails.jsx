import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Task creation state
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [taskTitle, setTaskTitle] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
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
        } catch (err) {
            setError('Failed to load event details');
        } finally {
            setLoading(false);
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
                assignedTo: assignedTo || undefined
            });
            setTaskTitle('');
            setAssignedTo('');
            setShowTaskForm(false);
            fetchEventAndTasks();
        } catch (err) {
            setTaskError(err.response?.data?.message || 'Failed to create task');
        } finally {
            setTaskLoading(false);
        }
    };

    const handleAssignTask = async (taskId, volunteerId) => {
        try {
            await api.put(`/tasks/${taskId}/assign`, { volunteerId });
            fetchEventAndTasks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to assign task');
        }
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

            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">{event.title}</h1>
                <p className="text-gray-600 mb-4">{event.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
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

            {/* Volunteers Section */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Volunteers</h2>
                {event.volunteers?.length === 0 ? (
                    <p className="text-gray-500">No volunteers have joined yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {event.volunteers?.map((volunteer) => (
                            <li key={volunteer._id} className="flex items-center gap-2 text-gray-700">
                                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                                    {volunteer.name?.charAt(0).toUpperCase()}
                                </span>
                                {volunteer.name} ({volunteer.email})
                            </li>
                        ))}
                    </ul>
                )}
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
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                                Assign To (Optional)
                            </label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Unassigned</option>
                                {event.volunteers?.map((volunteer) => (
                                    <option key={volunteer._id} value={volunteer._id}>
                                        {volunteer.name}
                                    </option>
                                ))}
                            </select>
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
                            <div key={task._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                    <p className="font-medium text-gray-800">{task.title}</p>
                                    <p className="text-sm text-gray-500">
                                        Status: <span className={`font-medium ${task.status === 'completed' ? 'text-green-600' :
                                                task.status === 'in-progress' ? 'text-yellow-600' : 'text-gray-600'
                                            }`}>{task.status}</span>
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {task.assignedTo ? (
                                        <span className="text-sm text-gray-600">
                                            Assigned to: {task.assignedTo.name}
                                        </span>
                                    ) : (
                                        <select
                                            onChange={(e) => e.target.value && handleAssignTask(task._id, e.target.value)}
                                            className="text-sm px-2 py-1 border border-gray-300 rounded"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Assign to...</option>
                                            {event.volunteers?.map((volunteer) => (
                                                <option key={volunteer._id} value={volunteer._id}>
                                                    {volunteer.name}
                                                </option>
                                            ))}
                                        </select>
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
