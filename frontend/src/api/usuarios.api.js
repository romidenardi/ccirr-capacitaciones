import api from './axios.js';

export const getUsuarios = () => api.get('/usuarios').then((res) => res.data);
export const createUsuario = (data) => api.post('/usuarios', data).then((res) => res.data);
export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data).then((res) => res.data);
export const restablecerPassword = (id) => api.post(`/usuarios/${id}/restablecer-password`).then((res) => res.data);
