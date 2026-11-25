// Conversión entre los datos de una capacitación (como los devuelve el backend) y el formulario.
// En el formulario todo es texto o sí/no: un campo vacío es '' (el backend lo guarda como null).

const texto = (valor) => (valor === null || valor === undefined ? '' : String(valor));
const hora = (valor) => texto(valor).slice(0, 5); // "18:30:00" → "18:30"
const numero = (valor) => (valor === null || valor === undefined ? '' : String(Number(valor))); // "15000.00" → "15000"

// Cada clase del formulario lleva una clave propia (_clave) para que React la identifique
// aunque todavía no tenga id (las clases nuevas reciben su id recién al guardar)
let contador = 0;
const nuevaClave = () => `clase-${(contador += 1)}`;

export const claseVacia = () => ({
  _clave: nuevaClave(),
  id: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  modalidad: 'presencial',
  lugar: '',
  linkVirtual: '',
  tema: '',
  disertante: '',
});

// Suma días a una fecha "AAAA-MM-DD" (sin problemas de zona horaria)
export const sumarDias = (fecha, dias) => {
  if (!fecha) return '';
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const d = new Date(Date.UTC(anio, mes - 1, dia + dias));
  return d.toISOString().slice(0, 10);
};

// Copia de una clase para la semana siguiente: mismo horario, modalidad y lugar; tema propio vacío
export const duplicarClase = (clase) => ({
  ...clase,
  _clave: nuevaClave(),
  id: '',
  fecha: sumarDias(clase.fecha, 7),
  tema: '',
});

export const VALORES_INICIALES = {
  nombre: '',
  temario: '',
  disertantes: '',
  exclusivoSocios: false,
  costoSocios: '',
  costoNoSocios: '',
  pagoObligatorio: false,
  instruccionesPago: '',
  entregaMaterial: false,
  entregaCertificado: false,
  asistenciaMinima: '75',
  cupo: '',
  estado: 'borrador',
  clases: [],
};

export const valoresIniciales = () => ({ ...VALORES_INICIALES, clases: [claseVacia()] });

const claseAFormulario = (c) => ({
  _clave: c.id || nuevaClave(),
  id: texto(c.id),
  fecha: texto(c.fecha),
  horaInicio: hora(c.horaInicio),
  horaFin: hora(c.horaFin),
  modalidad: c.modalidad || 'presencial',
  lugar: texto(c.lugar),
  linkVirtual: texto(c.linkVirtual),
  tema: texto(c.tema),
  disertante: texto(c.disertante),
});

export const aFormulario = (c) => ({
  ...VALORES_INICIALES,
  nombre: texto(c.nombre),
  temario: texto(c.temario),
  disertantes: texto(c.disertantes),
  exclusivoSocios: Boolean(c.exclusivoSocios),
  costoSocios: numero(c.costoSocios),
  costoNoSocios: numero(c.costoNoSocios),
  pagoObligatorio: Boolean(c.pagoObligatorio),
  instruccionesPago: texto(c.instruccionesPago),
  entregaMaterial: Boolean(c.entregaMaterial),
  entregaCertificado: Boolean(c.entregaCertificado),
  asistenciaMinima: numero(c.asistenciaMinima ?? 75),
  cupo: numero(c.cupo),
  estado: c.estado || 'borrador',
  clases: (c.clases?.length ? c.clases : [{}]).map(claseAFormulario),
});

// Lo que se envía al backend: sin las claves internas del formulario
export const aEnvio = (form) => ({
  ...form,
  clases: form.clases.map(({ _clave, id, ...clase }) => (id ? { id, ...clase } : clase)),
});

export const usaLugar = (modalidad) => modalidad === 'presencial' || modalidad === 'hibrida';
export const usaLink = (modalidad) => modalidad === 'virtual' || modalidad === 'hibrida';

// Clases a las que hay que asistir para el certificado (redondeo hacia arriba, igual que el backend)
export const clasesRequeridas = (totalClases, porcentaje) => Math.ceil((totalClases * Number(porcentaje)) / 100);

export const linkInscripcion = (slug, origen = window.location.origin) => `${origen}/inscripcion/${slug}`;

// Si con estos costos alguien tiene que pagar (para mostrar las opciones de pago)
export const tieneCosto = (form) =>
  Number(form.costoSocios) > 0 || (!form.exclusivoSocios && Number(form.costoNoSocios) > 0);
