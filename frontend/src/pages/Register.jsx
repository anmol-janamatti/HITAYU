import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = () => {
    // Step state: 1 = basic info, 2 = OTP verification, 3 = profile info
    const [step, setStep] = useState(1);

    // Basic info
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('volunteer');

    // OTP
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    // Profile info - Common
    const [phone, setPhone] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');

    // Volunteer specific
    const [skills, setSkills] = useState('');
    const [availability, setAvailability] = useState('flexible');

    // Admin specific
    const [organization, setOrganization] = useState('');
    const [position, setPosition] = useState('');

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const startResendCountdown = () => {
        setResendDisabled(true);
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleSendOTP = async () => {
        setError('');
        setLoading(true);
        try {
            await api.post('/otp/send', { email });
            setOtpSent(true);
            setStep(2);
            startResendCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/otp/verify', { email, otp });
            if (response.data.verified) {
                setOtpVerified(true);
                setStep(3);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError('');
        setOtp('');
        try {
            await api.post('/otp/send', { email });
            startResendCountdown();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const handleStep1Submit = (e) => {
        e.preventDefault();
        handleSendOTP();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userData = {
                username,
                email,
                password,
                role,
                phone: phone || null,
                bio: bio || null,
                location: location || null
            };

            if (role === 'volunteer') {
                userData.skills = skills.split(',').map(s => s.trim()).filter(s => s);
                userData.availability = availability;
            } else {
                userData.organization = organization || null;
                userData.position = position || null;
            }

            const user = await register(userData);
            navigate(user.role === 'admin' ? '/admin' : '/volunteer');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Create Account';
            case 2: return 'Verify Email';
            case 3: return 'Complete Profile';
            default: return 'Register';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">
                    {getStepTitle()}
                </h1>
                <p className="text-center text-gray-500 text-sm mb-6">
                    Step {step} of 3
                </p>

                {/* Progress bar */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3].map(s => (
                        <div
                            key={s}
                            className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleStep1Submit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="john_doe"
                                minLength={3}
                                maxLength={20}
                                required
                            />
                            <p className="text-xs text-gray-400 mt-1">Letters, numbers, underscore only. 3-20 characters.</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="john@example.com"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min. 6 characters"
                                minLength={6}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                I want to join as
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('volunteer')}
                                    className={`p-4 rounded-lg border-2 text-center transition-all ${role === 'volunteer'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-1 block">🙋</span>
                                    <span className="font-medium">Volunteer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`p-4 rounded-lg border-2 text-center transition-all ${role === 'admin'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-2xl mb-1 block">👔</span>
                                    <span className="font-medium">Coordinator</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Sending OTP...' : 'Continue'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <div>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">📧</span>
                            </div>
                            <p className="text-gray-600 text-sm">
                                We've sent a 6-digit code to<br />
                                <strong>{email}</strong>
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2 text-center">
                                Enter OTP
                            </label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-3"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="text-center">
                            <button
                                onClick={handleResendOTP}
                                disabled={resendDisabled}
                                className="text-blue-600 hover:underline text-sm disabled:text-gray-400 disabled:no-underline"
                            >
                                {resendDisabled ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                            </button>
                        </div>

                        <button
                            onClick={() => setStep(1)}
                            className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ← Change email
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span className="text-green-700 text-sm">Email verified: {email}</span>
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="+91 98765 43210"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                City / Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Bangalore, India"
                            />
                        </div>

                        {role === 'volunteer' ? (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Skills (comma separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Teaching, Driving, First Aid"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Availability
                                    </label>
                                    <select
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="weekdays">Weekdays Only</option>
                                        <option value="weekends">Weekends Only</option>
                                        <option value="both">Weekdays & Weekends</option>
                                        <option value="flexible">Flexible</option>
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Hitayu Foundation"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Your Position
                                    </label>
                                    <input
                                        type="text"
                                        value={position}
                                        onChange={(e) => setPosition(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Event Coordinator"
                                    />
                                </div>
                            </>
                        )}

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Bio (Optional)
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                )}

                <p className="mt-4 text-center text-gray-600 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
