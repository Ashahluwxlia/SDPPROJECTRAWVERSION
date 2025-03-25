import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5241',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Add interceptor to handle auth
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (user?.id) {
    config.headers.Authorization = `Bearer ${user.id}`;
  }
  return config;
});

export default api;