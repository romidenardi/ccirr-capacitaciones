import api from './axios.js';

// Rutas públicas: no necesitan sesión
export const getCapacitacionPublica = (slug) => api.get(`/publico/capacitaciones/${slug}`).then((res) => res.data);
export const buscarEmpresaPorCuit = (cuit) => api.get(`/publico/empresas/cuit/${cuit}`).then((res) => res.data);
export const enviarInscripcion = (slug, datos) =>
  api.post(`/publico/capacitaciones/${slug}/inscripciones`, datos).then((res) => res.data);
