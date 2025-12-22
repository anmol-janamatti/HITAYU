import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SelectRole = () => {
    const { pendingGoogleUser, updateRole, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Redirect if no pending user or already logged in
    if (!pendingGoogleUser) {
        return <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/volunteer') : '/login'} />;
    }

    const handleRoleSelect = async (role) => {
        setLoading(true);
        setError('');

        try {
            const userData = await updateRole(pendingGoogleUser._id, role);
            navigate(userData.role === 'admin' ? '/admin' : '/volunteer');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to set role');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    Welcome, {pendingGoogleUser.name}!
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Please select your role to continue
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <button
                        onClick={() => handleRoleSelect('volunteer')}
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-4 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex flex-col items-center"
                    >
                        <span className="text-lg font-semibold">Volunteer</span>
                        <span className="text-sm text-blue-200">Join events and help out</span>
                    </button>

                    <button
                        onClick={() => handleRoleSelect('admin')}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-4 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 flex flex-col items-center"
                    >
                        <span className="text-lg font-semibold">Admin (NGO Coordinator)</span>
                        <span className="text-sm text-green-200">Create and manage events</span>
                    </button>
                </div>

                {loading && (
                    <p className="mt-4 text-center text-gray-500">Setting up your account...</p>
                )}
            </div>
        </div>
    );
};

export default SelectRole;
