import api from './axios.js';

export const getInscripciones = (capacitacionId, filtros = {}) =>
  api.get(`/capacitaciones/${capacitacionId}/inscripciones`, { params: filtros }).then((res) => res.data);
export const createInscripcion = (capacitacionId, data) =>
  api.post(`/capacitaciones/${capacitacionId}/inscripciones`, data).then((res) => res.data);
export const getInscripcion = (id) => api.get(`/inscripciones/${id}`).then((res) => res.data);
export const updateInscripcion = (id, data) => api.put(`/inscripciones/${id}`, data).then((res) => res.data);
export const deleteInscripcion = (id) => api.delete(`/inscripciones/${id}`);
export const cambiarPago = (id, accion, motivo) =>
  api.post(`/inscripciones/${id}/pago`, { accion, motivo }).then((res) => res.data);

export const subirComprobante = (id, archivo) => {
  const datos = new FormData();
  datos.append('comprobante', archivo);
  return api.post(`/inscripciones/${id}/comprobante`, datos).then((res) => res.data);
};

// Archivos que piden sesión: se descargan con el token y se abren o guardan desde el navegador
export const getComprobante = (id) =>
  api.get(`/inscripciones/${id}/comprobante`, { responseType: 'blob' }).then((res) => res.data);
export const getExcelInscriptos = (capacitacionId) =>
  api.get(`/capacitaciones/${capacitacionId}/inscripciones/excel`, { responseType: 'blob' }).then((res) => res.data);

export const marcarAsistencia = (capacitacionId, datos) =>
  api.put(`/capacitaciones/${capacitacionId}/asistencias`, datos).then((res) => res.data);
