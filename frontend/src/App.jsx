import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import CompleteProfile from './pages/CompleteProfile';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import AdminEventDetails from './pages/admin/EventDetails';
import VolunteerEventList from './pages/volunteer/EventList';
import VolunteerEventDetails from './pages/volunteer/EventDetails';
import MyTasks from './pages/volunteer/MyTasks';

function App() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    // Helper to get redirect path for logged-in users
    const getRedirectPath = () => {
        if (!user) return '/login';
        if (!user.profileComplete) return '/complete-profile';
        return user.role === 'admin' ? '/admin' : '/volunteer';
    };

    // Hide navbar on public/auth pages
    const publicPages = ['/', '/login', '/complete-profile'];
    const showNavbar = user && user.profileComplete && !publicPages.includes(location.pathname);

    return (
        <div className={`min-h-screen ${showNavbar ? 'bg-gray-100' : ''}`}>
            {showNavbar && <Navbar />}
            <Routes>
                {/* Landing Page */}
                <Route
                    path="/"
                    element={
                        user && user.profileComplete
                            ? <Navigate to={getRedirectPath()} />
                            : <Landing />
                    }
                />

                {/* Auth Routes */}
                <Route
                    path="/login"
                    element={
                        user && user.profileComplete
                            ? <Navigate to={getRedirectPath()} />
                            : <Login />
                    }
                />
                <Route path="/complete-profile" element={<CompleteProfile />} />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
                <Route path="/admin/events/create" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <CreateEvent />
                    </ProtectedRoute>
                } />
                <Route path="/admin/events/:id" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminEventDetails />
                    </ProtectedRoute>
                } />

                {/* Volunteer Routes */}
                <Route path="/volunteer" element={
                    <ProtectedRoute allowedRoles={['volunteer']}>
                        <VolunteerEventList />
                    </ProtectedRoute>
                } />
                <Route path="/volunteer/events/:id" element={
                    <ProtectedRoute allowedRoles={['volunteer']}>
                        <VolunteerEventDetails />
                    </ProtectedRoute>
                } />
                <Route path="/volunteer/tasks" element={
                    <ProtectedRoute allowedRoles={['volunteer']}>
                        <MyTasks />
                    </ProtectedRoute>
                } />

                {/* Profile Route - accessible by all authenticated users */}
                <Route path="/profile" element={
                    <ProtectedRoute allowedRoles={['admin', 'volunteer']}>
                        <Profile />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
