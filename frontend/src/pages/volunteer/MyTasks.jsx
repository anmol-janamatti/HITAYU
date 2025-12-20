import { useState, useEffect } from 'react';
import api from '../../api/axios';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks/my-tasks');
            setTasks(response.data);
        } catch (err) {
            setError('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}/status`, { status: newStatus });
            fetchTasks();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in-progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Tasks</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {tasks.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-600">You don't have any assigned tasks yet.</p>
                    <p className="text-gray-500 text-sm mt-2">
                        Join events to get tasks assigned to you.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map((task) => (
                        <div key={task._id} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-gray-800">{task.title}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Event: {task.eventId?.title || 'Unknown Event'}
                                    </p>
                                    {task.eventId?.date && (
                                        <p className="text-sm text-gray-500">
                                            📅 {new Date(task.eventId.date).toLocaleDateString()} | 📍 {task.eventId.location}
                                        </p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                                    {task.status}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-gray-600">Update Status:</span>
                                <select
                                    value={task.status}
                                    onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyTasks;
