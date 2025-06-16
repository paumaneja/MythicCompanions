import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      if (status === 401 || status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');

        const isAuthPage = window.location.pathname === '/' || window.location.pathname === '/register';

        if (!isAuthPage) {
          console.error("Authentication error on a protected page. Redirecting to login.");
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);


export default api;