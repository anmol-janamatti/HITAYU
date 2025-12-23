// Dynamic API configuration - works for both development and production
const isProduction = import.meta.env.PROD;

// In production, use environment variable; in dev, use current hostname
const API_BASE_URL = isProduction
    ? import.meta.env.VITE_API_URL
    : `http://${window.location.hostname}:5000`;

export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;
export { API_BASE_URL };

// Helper function to get image URL
// Returns full URL for Cloudinary URLs, or constructs local path for legacy filenames
export const getImageUrl = (imagePath, folder = 'events') => {
    if (!imagePath) return null;
    // If it's already a full URL (Cloudinary), return as-is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }
    // Otherwise, construct the local path (for backward compatibility)
    return `${UPLOADS_URL}/${folder}/${imagePath}`;
};
