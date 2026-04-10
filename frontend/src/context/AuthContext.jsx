import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('aiad_user');
        const storedRole = localStorage.getItem('aiad_role');
        if (storedUser && storedRole) {
            setUser({ username: storedUser, role: storedRole });
        }
        setLoading(false);
    }, []);

    const login = async (username, password, role) => {
        setError(null);
        try {
            const response = await axios.post('/api/auth/login', { username, password, role });
            if (response.data.success) {
                const userData = response.data.user;
                localStorage.setItem('aiad_user', userData.username);
                localStorage.setItem('aiad_role', userData.role);
                setUser(userData);
                return true;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your connection.');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('aiad_user');
        localStorage.removeItem('aiad_role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};
