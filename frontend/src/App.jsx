import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import CreateEvent from './pages/admin/CreateEvent';
import AdminEventDetails from './pages/admin/EventDetails';
import VolunteerEventList from './pages/volunteer/EventList';
import VolunteerEventDetails from './pages/volunteer/EventDetails';
import MyTasks from './pages/volunteer/MyTasks';

function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Login />}
                />
                <Route
                    path="/register"
                    element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} /> : <Register />}
                />

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

                {/* Default Redirect */}
                <Route path="/" element={
                    user
                        ? <Navigate to={user.role === 'admin' ? '/admin' : '/volunteer'} />
                        : <Navigate to="/login" />
                } />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;
