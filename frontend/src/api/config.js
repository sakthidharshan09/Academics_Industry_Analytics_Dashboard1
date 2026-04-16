/**
 * Centralized API configuration for handling different environments.
 * In Vercel production, the backend is reachable via the /_/backend prefix.
 * In local development, we use the standard /api prefix handled by Vite's proxy.
 */
const getApiBaseUrl = () => {
    // Check if we are running in Vercel production
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
        // Vercel multi-service routing
        return '/_/backend/api';
    }
    
    // Local development (Vite proxy)
    return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
