import { createContext, useState, useEffect } from 'react';
import { login, logout, getCurrentUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = getCurrentUser();
        if (token) {
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const handleLogin = async (username, password) => {
        try {
            const data = await login(username, password);
            setUser({ token: data.access });
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, message: "Invalid credentials" };
        }
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login: handleLogin, logout: handleLogout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
