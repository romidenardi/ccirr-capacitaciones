import api from './axios.js';

export const getCapacitaciones = () => api.get('/capacitaciones').then((res) => res.data);
export const getCapacitacion = (id) => api.get(`/capacitaciones/${id}`).then((res) => res.data);
export const createCapacitacion = (data) => api.post('/capacitaciones', data).then((res) => res.data);
export const updateCapacitacion = (id, data) => api.put(`/capacitaciones/${id}`, data).then((res) => res.data);
export const deleteCapacitacion = (id) => api.delete(`/capacitaciones/${id}`);
