// src/services/api.ts
import axios from 'axios';

// Create an Axios instance with the base URL of our backend.
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

// Use an interceptor to automatically add the JWT token to every request header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // If a token exists, add it to the Authorization header before sending the request.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;