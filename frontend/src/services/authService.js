import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

export const login = async (username, password) => {
    // Login directly with axios to avoid interceptor issues, but use the base URL
    const response = await axios.post(`${API_URL}token/`, {
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
