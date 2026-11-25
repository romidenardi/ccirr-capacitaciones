// Limpia los datos que llegan del formulario antes de guardarlos.
// En la capacitación:
// - textos sin espacios de más, y vacíos como null (campo sin completar)
// - números vacíos como null (costo vacío = sin costo; cupo vacío = sin límite)
// - si es exclusiva para socios, no tiene costo para no socios
// En cada clase:
// - el link virtual solo queda si la modalidad lo usa, y el lugar solo si es presencial o híbrida

const vacio = (valor) => valor === null || valor === undefined || String(valor).trim() === '';
const textoOpcional = (valor) => (vacio(valor) ? null : String(valor).trim());

export const normalizarClase = (clase) => {
  const limpia = {
    id: clase.id || undefined,
    fecha: clase.fecha,
    horaInicio: clase.horaInicio,
    horaFin: textoOpcional(clase.horaFin),
    modalidad: clase.modalidad || 'presencial',
    lugar: textoOpcional(clase.lugar),
    linkVirtual: textoOpcional(clase.linkVirtual),
    tema: textoOpcional(clase.tema),
    disertante: textoOpcional(clase.disertante),
  };
  if (limpia.modalidad === 'presencial') limpia.linkVirtual = null;
  if (limpia.modalidad === 'virtual') limpia.lugar = null;
  return limpia;
};

const TEXTOS_OPCIONALES = ['temario', 'disertantes'];
const NUMEROS_OPCIONALES = ['costoSocios', 'costoNoSocios', 'cupo'];

export const normalizarCapacitacion = (datos, actual = {}) => {
  const limpio = { ...datos };

  if (typeof limpio.nombre === 'string') limpio.nombre = limpio.nombre.trim();

  for (const campo of TEXTOS_OPCIONALES) {
    if (campo in limpio) limpio[campo] = textoOpcional(limpio[campo]);
  }
  for (const campo of NUMEROS_OPCIONALES) {
    if (campo in limpio) limpio[campo] = vacio(limpio[campo]) ? null : Number(limpio[campo]);
  }
  if ('asistenciaMinima' in limpio) {
    limpio.asistenciaMinima = vacio(limpio.asistenciaMinima) ? 100 : Number(limpio.asistenciaMinima);
  }

  const exclusivo = limpio.exclusivoSocios ?? actual.exclusivoSocios;
  if (exclusivo) limpio.costoNoSocios = null;

  return limpio;
};

// Cuántas clases tiene que haber asistido una persona para recibir el certificado.
// Se redondea hacia arriba: con 4 clases y 75%, son 3; con 3 clases y 75%, también 3 (2,25 → 3).
export const clasesRequeridas = (totalClases, porcentaje) => Math.ceil((totalClases * porcentaje) / 100);
