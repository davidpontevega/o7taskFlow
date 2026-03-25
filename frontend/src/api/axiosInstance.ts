import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5116/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar JWT en cada request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('o7tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirigir a login en 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('o7tf_token');
      localStorage.removeItem('o7tf_session');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;