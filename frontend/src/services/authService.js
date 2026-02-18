import api from './api';
import axios from 'axios';

export const login = async (username, password) => {
    // Login with the api instance to use common base URL and headers
    const response = await api.post('token/', {
        username,
        password
    });
    if (response.data.access) {
        localStorage.setItem('access', response.data.access);
        localStorage.setItem('refresh', response.data.refresh);
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
};

export const getCurrentUser = () => {
    return localStorage.getItem('access');
};
