// Formatos para mostrar datos en pantalla, en castellano de Argentina

export const formatearFecha = (iso) => {
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('-').map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const formatearHora = (hora) => (hora ? hora.slice(0, 5) : '');

// null o vacío = sin costo
export const formatearCosto = (valor) => {
  if (valor === null || valor === undefined || valor === '' || Number(valor) === 0) return 'Sin costo';
  return Number(valor).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
};

const MODALIDADES = { presencial: 'Presencial', virtual: 'Virtual', hibrida: 'Híbrida' };
export const formatearModalidad = (modalidad) => MODALIDADES[modalidad] || modalidad;

// Resumen de las modalidades de todas las clases ("presencial,virtual" → "Combinada")
export const formatearModalidades = (lista) => {
  const modalidades = String(lista || '')
    .split(',')
    .filter(Boolean);
  if (modalidades.length === 0) return '';
  return modalidades.length === 1 ? formatearModalidad(modalidades[0]) : 'Combinada';
};

// Fecha corta para listados: "10/12/2026"
export const formatearFechaCorta = (iso) => {
  if (!iso) return '';
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
};

const ESTADOS = { borrador: 'Borrador', publicada: 'Publicada', finalizada: 'Finalizada', cancelada: 'Cancelada' };
export const formatearEstado = (estado) => ESTADOS[estado] || estado;
