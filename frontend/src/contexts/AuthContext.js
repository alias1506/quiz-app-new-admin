import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        // Enforce session storage check for "browser close" logout
        const isSessionActive = sessionStorage.getItem('isSessionActive');

        if (!isSessionActive) {
            // If no session flag, but we might have a lingering cookie, force logout to clean up
            if (!location.hash.includes('login')) {
                // Only attempt cleanup if not already on login (prevents loops)
                try { await authAPI.logout(); } catch (e) { /* ignore */ }
            }
            setUser(null);
            setAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.checkAuth();
            if (response.data.authenticated) {
                setUser(response.data.admin);
                setAuthenticated(true);
            } else {
                setUser(null);
                setAuthenticated(false);
                sessionStorage.removeItem('isSessionActive');
            }
        } catch (error) {
            setUser(null);
            setAuthenticated(false);
            sessionStorage.removeItem('isSessionActive');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            if (response.data.success) {
                setUser(response.data.admin);
                setAuthenticated(true);
                sessionStorage.setItem('isSessionActive', 'true');
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, message };
        }
    };

    const register = async (data) => {
        try {
            const response = await authAPI.register(data);
            if (response.data.success) {
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            // Ignore logout errors
        } finally {
            setUser(null);
            setAuthenticated(false);
            sessionStorage.removeItem('isSessionActive');
        }
    };

    const value = {
        user,
        loading,
        authenticated,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
