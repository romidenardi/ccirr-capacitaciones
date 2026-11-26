import api from './axios.js';

export const login = (email, password) => api.post('/auth/login', { email, password }).then((res) => res.data);
export const getYo = () => api.get('/auth/yo').then((res) => res.data);
export const cambiarPassword = (actual, nueva) =>
  api.post('/auth/cambiar-password', { actual, nueva }).then((res) => res.data);
