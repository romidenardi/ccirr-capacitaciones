import axios from 'axios';

export const CLAVE_TOKEN = 'ccirr_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Cada pedido lleva el token de la sesión, si hay una
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si el backend responde 401 (sesión vencida o inválida), se borra la sesión y se vuelve al login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) {
      localStorage.removeItem(CLAVE_TOKEN);
      if (window.location.pathname !== '/login') {
        const volver = encodeURIComponent(window.location.pathname);
        window.location.href = `/login?volver=${volver}`;
      }
    }
    return Promise.reject(error);
  },
);

// Mensaje para mostrar en pantalla a partir de un error de Axios
export const mensajeDeError = (error, porDefecto = 'Algo salió mal. Probá de nuevo.') => {
  if (!error.response) return 'No se pudo conectar con el servidor. Revisá que el backend esté corriendo.';
  return error.response.data?.message || porDefecto;
};

export default api;
