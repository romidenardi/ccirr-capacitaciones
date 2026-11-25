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

const ESTADOS = { borrador: 'Borrador', publicada: 'Publicada', finalizada: 'Finalizada', cancelada: 'Cancelada' };
export const formatearEstado = (estado) => ESTADOS[estado] || estado;
