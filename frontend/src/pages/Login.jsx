import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);

        try {
            const result = await googleLogin(credentialResponse.credential);

            if (!result.profileComplete) {
                // New user or incomplete profile
                navigate('/complete-profile');
            } else {
                // Existing user with complete profile
                navigate(result.role === 'admin' ? '/admin' : '/volunteer');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Google login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    Welcome to Hitayu
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Continue with your Google account
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="flex justify-center">
                    {loading ? (
                        <p className="text-gray-500">Signing in...</p>
                    ) : (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google login failed')}
                            theme="outline"
                            size="large"
                            width="100%"
                            text="continue_with"
                        />
                    )}
                </div>

                <p className="mt-6 text-center text-gray-500 text-sm">
                    By continuing, you agree to our Terms of Service
                </p>
            </div>
        </div>
    );
};

export default Login;
