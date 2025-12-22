// Dynamic API configuration - works for both development and production
const isProduction = import.meta.env.PROD;

// In production, use environment variable; in dev, use current hostname
const API_BASE_URL = isProduction
    ? import.meta.env.VITE_API_URL
    : `http://${window.location.hostname}:5000`;

export const API_URL = `${API_BASE_URL}/api`;
export const UPLOADS_URL = `${API_BASE_URL}/uploads`;
export { API_BASE_URL };
