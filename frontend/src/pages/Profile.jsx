import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getImageUrl } from '../config';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await api.get('/profile');
            setProfile(response.data);
            setFormData(response.data);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            const updateData = {
                phone: formData.phone,
                bio: formData.bio,
                location: formData.location
            };

            if (profile.role === 'volunteer') {
                updateData.skills = typeof formData.skills === 'string'
                    ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
                    : formData.skills;
                updateData.availability = formData.availability;
            } else {
                updateData.organization = formData.organization;
                updateData.position = formData.position;
            }

            const response = await api.put('/profile', updateData);
            setProfile(response.data);
            setFormData(response.data);
            setEditing(false);

            // Update local storage
            const storedUser = JSON.parse(localStorage.getItem('user'));
            localStorage.setItem('user', JSON.stringify({ ...storedUser, ...response.data }));
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    const getInitial = () => profile?.username?.charAt(0)?.toUpperCase() || '?';

    const formatAvailability = (val) => {
        const map = {
            weekdays: 'Weekdays Only',
            weekends: 'Weekends Only',
            both: 'Weekdays & Weekends',
            flexible: 'Flexible'
        };
        return map[val] || val || 'Not specified';
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link
                to={user?.role === 'admin' ? '/admin' : '/volunteer'}
                className="text-blue-600 hover:underline mb-4 inline-block"
            >
                ← Back
            </Link>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Header with avatar */}
                <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold shadow-lg">
                        {profile?.avatar ? (
                            <img
                                src={getImageUrl(profile.avatar)}
                                alt="Avatar"
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            getInitial()
                        )}
                    </div>
                    <h1 className="mt-4 text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        @{profile?.username}
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 rounded-full">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm">{profile?.email}</p>
                </div>

                {/* Profile info */}
                <div className="p-6 space-y-4">
                    <ProfileRow
                        label="Role"
                        value={
                            <span className={`inline-flex items-center gap-1 ${profile?.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                                {profile?.role === 'admin' ? '👔' : '🙋'} {profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1)}
                            </span>
                        }
                    />

                    <ProfileRow
                        label="Phone"
                        editing={editing}
                        value={formData.phone}
                        onChange={(val) => handleChange('phone', val)}
                        placeholder="Add phone number"
                    />

                    <ProfileRow
                        label="Location"
                        editing={editing}
                        value={formData.location}
                        onChange={(val) => handleChange('location', val)}
                        placeholder="Add location"
                    />

                    {profile?.role === 'volunteer' ? (
                        <>
                            <ProfileRow
                                label="Skills"
                                editing={editing}
                                value={Array.isArray(formData.skills) ? formData.skills.join(', ') : formData.skills}
                                onChange={(val) => handleChange('skills', val)}
                                placeholder="Add skills"
                            />
                            <ProfileRow
                                label="Availability"
                                value={
                                    editing ? (
                                        <select
                                            value={formData.availability || 'flexible'}
                                            onChange={(e) => handleChange('availability', e.target.value)}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="weekdays">Weekdays Only</option>
                                            <option value="weekends">Weekends Only</option>
                                            <option value="both">Weekdays & Weekends</option>
                                            <option value="flexible">Flexible</option>
                                        </select>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-sm">
                                            {formatAvailability(formData.availability)}
                                        </span>
                                    )
                                }
                            />
                        </>
                    ) : (
                        <>
                            <ProfileRow
                                label="Organization"
                                editing={editing}
                                value={formData.organization}
                                onChange={(val) => handleChange('organization', val)}
                                placeholder="Add organization"
                            />
                            <ProfileRow
                                label="Position"
                                editing={editing}
                                value={formData.position}
                                onChange={(val) => handleChange('position', val)}
                                placeholder="Add position"
                            />
                        </>
                    )}

                    <ProfileRow
                        label="Bio"
                        editing={editing}
                        value={formData.bio}
                        onChange={(val) => handleChange('bio', val)}
                        placeholder="Add a bio"
                        multiline
                    />

                    <ProfileRow
                        label="Member Since"
                        value={new Date(profile?.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    />
                </div>

                {/* Action buttons */}
                <div className="px-6 pb-6">
                    {editing ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setEditing(false);
                                    setFormData(profile);
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setEditing(true)}
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper component for profile rows
const ProfileRow = ({ label, value, editing, onChange, placeholder, multiline }) => (
    <div className="flex items-start py-2 border-b border-gray-100 last:border-0">
        <span className="w-32 text-gray-400 text-sm flex-shrink-0">{label}:</span>
        <div className="flex-1">
            {editing && onChange ? (
                multiline ? (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={2}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                ) : (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                )
            ) : (
                <span className="text-gray-800 text-sm">
                    {value || <span className="text-gray-400">{placeholder || 'Not specified'}</span>}
                </span>
            )}
        </div>
    </div>
);

export default Profile;
