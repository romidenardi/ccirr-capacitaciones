// Limpia los datos que llegan del formulario antes de guardarlos:
// - textos sin espacios de más, y vacíos como null (campo sin completar)
// - números vacíos como null (costo vacío = sin costo; cupo vacío = sin límite)
// - si es exclusiva para socios, no tiene costo para no socios
// - el link virtual solo queda si la modalidad lo usa, y el lugar solo si es presencial o híbrida

const TEXTOS_OPCIONALES = ['horaFin', 'lugar', 'linkVirtual', 'temario', 'disertantes'];
const NUMEROS_OPCIONALES = ['costoSocios', 'costoNoSocios', 'cupo'];

const vacio = (valor) => valor === null || valor === undefined || String(valor).trim() === '';

export const normalizarCapacitacion = (datos, actual = {}) => {
  const limpio = { ...datos };

  if (typeof limpio.nombre === 'string') limpio.nombre = limpio.nombre.trim();

  for (const campo of TEXTOS_OPCIONALES) {
    if (campo in limpio) limpio[campo] = vacio(limpio[campo]) ? null : String(limpio[campo]).trim();
  }
  for (const campo of NUMEROS_OPCIONALES) {
    if (campo in limpio) limpio[campo] = vacio(limpio[campo]) ? null : Number(limpio[campo]);
  }

  const exclusivo = limpio.exclusivoSocios ?? actual.exclusivoSocios;
  if (exclusivo) limpio.costoNoSocios = null;

  const modalidad = limpio.modalidad ?? actual.modalidad;
  if (modalidad === 'presencial') limpio.linkVirtual = null;
  if (modalidad === 'virtual') limpio.lugar = null;

  return limpio;
};
