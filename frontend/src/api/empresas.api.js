import api from './axios.js';

export const getEmpresas = (filtros = {}) => api.get('/empresas', { params: filtros }).then((res) => res.data);
export const getRubros = () => api.get('/empresas/rubros').then((res) => res.data);
export const getEmpresa = (id) => api.get(`/empresas/${id}`).then((res) => res.data);
export const createEmpresa = (data) => api.post('/empresas', data).then((res) => res.data);
export const updateEmpresa = (id, data) => api.put(`/empresas/${id}`, data).then((res) => res.data);
export const deleteEmpresa = (id) => api.delete(`/empresas/${id}`);
