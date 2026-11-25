// Reglas del formulario público de inscripción

export const VALORES_INSCRIPCION = {
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  email: '',
  telefono: '',
  cuit: '',
  organizacion: '',
  esSocio: '', // 'si' | 'no' (solo se pregunta si la organización no está cargada)
  cargo: '',
  comoSeEntero: '',
  consentimiento: false,
  sitioWeb: '', // campo trampa para robots: queda vacío
};

export const CANALES = [
  { valor: 'mail', texto: 'Mail del CCIRR' },
  { valor: 'whatsapp', texto: 'WhatsApp' },
  { valor: 'web', texto: 'Sitio web' },
  { valor: 'redes', texto: 'Redes sociales' },
  { valor: 'colega', texto: 'Me lo comentó alguien' },
  { valor: 'otro', texto: 'Otro' },
];

// Lo que paga según sea socio o no (null = sin costo). Igual que el backend.
export const montoAPagar = (capacitacion, esSocio) => {
  const costo = esSocio ? capacitacion.costoSocios : capacitacion.costoNoSocios;
  const numero = costo === null || costo === undefined ? 0 : Number(costo);
  return numero > 0 ? numero : null;
};

// Si es socio: lo dice la empresa registrada o, si es nueva, lo que responde la persona. null = todavía no se sabe.
export const esSocioEfectivo = (empresa, respuesta) => {
  if (empresa?.encontrada) return empresa.esSocia;
  if (respuesta === 'si') return true;
  if (respuesta === 'no') return false;
  return null;
};

export const TIPOS_COMPROBANTE = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
export const MAXIMO_COMPROBANTE = 5 * 1024 * 1024;

// Arma el envío (multipart: datos + archivo)
export const armarEnvio = (form, { empresa, comprobante }) => {
  const datos = new FormData();
  const campos = [
    'nombre',
    'apellido',
    'dni',
    'fechaNacimiento',
    'email',
    'telefono',
    'cargo',
    'comoSeEntero',
    'sitioWeb',
  ];
  for (const campo of campos) datos.append(campo, form[campo]);
  datos.append('cuit', form.cuit);
  datos.append('organizacion', empresa?.encontrada ? empresa.nombre : form.organizacion);
  datos.append('esSocio', String(esSocioEfectivo(empresa, form.esSocio) === true));
  datos.append('consentimiento', String(form.consentimiento));
  if (comprobante) datos.append('comprobante', comprobante);
  return datos;
};
