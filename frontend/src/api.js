import axios from "axios";

const API = axios.create({
    // baseURL: "https://82fa-46-193-16-66.ngrok-free.app/api/",
    baseURL: "http://localhost:8000/api/",
    headers: {
        "ngrok-skip-browser-warning": "true",
    }
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("access");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
