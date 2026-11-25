// Textos y conversiones de las inscripciones en administración

export const ESTADOS_PAGO = {
  sin_costo: { texto: 'Sin costo', clase: '' },
  pendiente: { texto: 'Pendiente', clase: 'estado--revisar' },
  revisar: { texto: 'Comprobante a revisar', clase: 'estado--atencion' },
  confirmado: { texto: 'Confirmado', clase: 'estado--publicada' },
  rechazado: { texto: 'Rechazado', clase: 'estado--cancelada' },
};

export const FILTROS_PAGO = [
  { valor: '', texto: 'Todos los pagos' },
  { valor: 'revisar', texto: 'Comprobante a revisar' },
  { valor: 'pendiente', texto: 'Pendiente (sin comprobante)' },
  { valor: 'confirmado', texto: 'Confirmado' },
  { valor: 'rechazado', texto: 'Rechazado' },
  { valor: 'sin_costo', texto: 'Sin costo' },
];

export const VALORES_INSCRIPCION_ADMIN = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  dni: '',
  fechaNacimiento: '',
  cuit: '',
  organizacion: '',
  cargo: '',
  esSocio: false,
  monto: '',
  comoSeEntero: '',
};

const texto = (v) => (v === null || v === undefined ? '' : String(v));

export const inscripcionAFormulario = (i) => ({
  nombre: texto(i.nombre),
  apellido: texto(i.apellido),
  email: texto(i.email),
  telefono: texto(i.telefono),
  dni: texto(i.dni),
  fechaNacimiento: texto(i.fechaNacimiento),
  cuit: texto(i.cuit),
  organizacion: texto(i.organizacion),
  cargo: texto(i.cargo),
  esSocio: Boolean(i.esSocio),
  monto: i.monto ? String(Number(i.monto)) : '',
  comoSeEntero: texto(i.comoSeEntero),
});

// En la edición, el CUIT no se cambia desde acá (la empresa se vincula aparte)
export const aEnvioEdicion = ({ cuit, ...resto }) => resto;
