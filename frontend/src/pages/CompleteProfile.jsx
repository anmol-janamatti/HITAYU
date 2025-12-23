import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const CompleteProfile = () => {
    const { user, setUser, token } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: '',
        role: '',
        phone: '',
        bio: '',
        location: '',
        skills: '',
        availability: '',
        organization: '',
        position: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already complete or not logged in
    if (!user) {
        return <Navigate to="/login" />;
    }
    if (user.profileComplete) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const submitData = {
                username: formData.username,
                role: formData.role,
                phone: formData.phone || undefined,
                bio: formData.bio || undefined,
                location: formData.location || undefined
            };

            // Add role-specific fields
            if (formData.role === 'volunteer') {
                submitData.skills = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];
                submitData.availability = formData.availability || undefined;
            } else if (formData.role === 'admin') {
                submitData.organization = formData.organization || undefined;
                submitData.position = formData.position || undefined;
            }

            const response = await api.put('/auth/complete-profile', submitData);
            const { token: newToken, ...userData } = response.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);

            navigate(userData.role === 'admin' ? '/admin' : '/volunteer');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    Complete Your Profile
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Just a few more details to get started
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Username */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Username *
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            minLength={3}
                            maxLength={20}
                            pattern="^[a-zA-Z0-9_]+$"
                            placeholder="e.g., john_doe"
                        />
                        <p className="text-xs text-gray-500 mt-1">3-20 characters, letters, numbers, underscores</p>
                    </div>

                    {/* Role */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            I want to be a *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${formData.role === 'volunteer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="volunteer"
                                    checked={formData.role === 'volunteer'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="sr-only"
                                    required
                                />
                                <span className="text-2xl block mb-1">🙋</span>
                                <span className="font-medium">Volunteer</span>
                            </label>
                            <label className={`p-4 border-2 rounded-lg cursor-pointer text-center transition-colors ${formData.role === 'admin' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                }`}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="admin"
                                    checked={formData.role === 'admin'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="sr-only"
                                />
                                <span className="text-2xl block mb-1">👔</span>
                                <span className="font-medium">NGO Admin</span>
                            </label>
                        </div>
                    </div>

                    {/* Volunteer-specific fields */}
                    {formData.role === 'volunteer' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Skills (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., teaching, first aid, driving"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Availability
                                </label>
                                <select
                                    value={formData.availability}
                                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select availability</option>
                                    <option value="weekdays">Weekdays</option>
                                    <option value="weekends">Weekends</option>
                                    <option value="both">Both</option>
                                    <option value="flexible">Flexible</option>
                                </select>
                            </div>
                        </>
                    )}

                    {/* Admin-specific fields */}
                    {formData.role === 'admin' && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Organization Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Green Earth Foundation"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-medium mb-2">
                                    Your Position
                                </label>
                                <input
                                    type="text"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Coordinator, Manager"
                                />
                            </div>
                        </>
                    )}

                    {/* Optional common fields */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Bangalore, India"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !formData.username || !formData.role}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? 'Saving...' : 'Complete Setup'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
