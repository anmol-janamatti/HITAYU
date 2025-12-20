import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-8">
                        <Link to={user.role === 'admin' ? '/admin' : '/volunteer'} className="font-bold text-xl">
                            NGO Portal
                        </Link>

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

                    <div className="flex items-center space-x-4">
                        <span className="text-sm">
                            {user.name} ({user.role})
                        </span>
                        <button
                            onClick={handleLogout}
                            className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
