import { createContext, useState, useEffect } from 'react';
import { login, logout, getCurrentUser, getMe } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = getCurrentUser();
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const profile = await getMe();
                setUser({ token, ...profile });
            } catch (error) {
                logout();
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const refreshUser = async () => {
        const token = getCurrentUser();
        if (!token) return null;
        const profile = await getMe();
        const nextUser = { token, ...profile };
        setUser(nextUser);
        return nextUser;
    };

    const handleLogin = async (username, password) => {
        try {
            const data = await login(username, password);
            const profile = await getMe();
            setUser({ token: data.access, ...profile });
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            const message = error.response?.data?.detail || error.response?.data?.message || "Invalid credentials or connection error";
            return { success: false, message: message };
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};
