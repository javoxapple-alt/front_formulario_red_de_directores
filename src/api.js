import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Exportar la instancia para que AuthContext también la use
export default api;

export const createRegistration = (data) => api.post('/registrations', data);
export const getRegistrations   = (area = '') => api.get('/registrations', { params: area ? { area } : {} });
export const getStats           = () => api.get('/registrations/stats');
export const deleteRegistration = (id) => api.delete(`/registrations/${id}`);
export const login              = (email, password) => api.post('/auth/login', { email, password });
export const getMe              = () => api.get('/auth/me');
