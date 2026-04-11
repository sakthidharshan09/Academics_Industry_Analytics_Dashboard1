/**
 * Centralized API configuration for handling different environments.
 * In Vercel production, the backend is reachable via the /_/backend prefix.
 * In local development, we use the standard /api prefix handled by Vite's proxy.
 */
const getApiBaseUrl = () => {
    // Check if we are running in local development
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (isLocal) {
        // Local development (Vite proxy handles /api -> localhost:5000/api)
        return '/api';
    }
    
    // Production Render backend
    return 'https://academics-industry-analytics-backend.onrender.com/api';
};

export const API_BASE_URL = getApiBaseUrl();
