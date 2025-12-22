import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import SelectRole from './pages/SelectRole';
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

    // Hide navbar on landing, login, register pages for cleaner look
    const publicPages = ['/', '/login', '/register', '/select-role'];
    const showNavbar = user && !publicPages.includes(location.pathname);

    return (
        <div className={`min-h-screen ${showNavbar ? 'bg-gray-100' : ''}`}>
            {showNavbar && <Navbar />}
            <Routes>
                {/* Landing Page */}
                <Route
                    path="/"
                    element={
                        user
                            ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} />
                            : <Landing />
                    }
                />

                {/* Public Routes */}
                <Route
                    path="/login"
                    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Login />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Register />}
                />
                <Route path="/select-role" element={<SelectRole />} />

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


