import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to={user.role === 'admin' ? '/admin' : '/volunteer'} className="font-bold text-xl">
                        Hitayu
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin" className="hover:text-blue-200">Dashboard</Link>
                                <Link to="/admin/events/create" className="hover:text-blue-200">Create Event</Link>
                            </>
                        )}

                        {user.role === 'volunteer' && (
                            <>
                                <Link to="/volunteer" className="hover:text-blue-200">Events</Link>
                                <Link to="/volunteer/tasks" className="hover:text-blue-200">My Tasks</Link>
                            </>
                        )}
                    </div>

                    {/* Desktop User Info */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/profile" className="hover:text-blue-200">
                            {user.username}
                        </Link>
                        <span className="text-xs bg-blue-500 px-2 py-0.5 rounded">
                            {user.role}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm"
                        >
                            Logout
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded hover:bg-blue-700"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 space-y-2">
                        {user.role === 'admin' && (
                            <>
                                <Link
                                    to="/admin"
                                    className="block py-2 px-3 hover:bg-blue-700 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/admin/events/create"
                                    className="block py-2 px-3 hover:bg-blue-700 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Create Event
                                </Link>
                            </>
                        )}

                        {user.role === 'volunteer' && (
                            <>
                                <Link
                                    to="/volunteer"
                                    className="block py-2 px-3 hover:bg-blue-700 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Events
                                </Link>
                                <Link
                                    to="/volunteer/tasks"
                                    className="block py-2 px-3 hover:bg-blue-700 rounded"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    My Tasks
                                </Link>
                            </>
                        )}

                        <div className="border-t border-blue-500 pt-3 mt-3">
                            <Link
                                to="/profile"
                                className="block py-2 px-3 hover:bg-blue-700 rounded"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                👤 Profile
                            </Link>
                            <p className="text-sm px-3 my-2 text-blue-200">{user.username}</p>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left py-2 px-3 hover:bg-blue-700 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
