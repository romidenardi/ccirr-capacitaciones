// Formulario de empresa y formato del CUIT

export const VALORES_INICIALES_EMPRESA = {
  nombre: '',
  rubro: '',
  cuit: '',
  emailContacto: '',
  esSocia: false,
  pendienteRevision: false,
};

// "20123456786" → "20-12345678-6" (si no tiene 11 dígitos, lo deja como está)
export const formatearCuit = (cuit) => {
  const digitos = String(cuit ?? '').replace(/\D/g, '');
  if (digitos.length !== 11) return String(cuit ?? '');
  return `${digitos.slice(0, 2)}-${digitos.slice(2, 10)}-${digitos.slice(10)}`;
};

export const empresaAFormulario = (e) => ({
  nombre: e.nombre ?? '',
  rubro: e.rubro ?? '',
  cuit: formatearCuit(e.cuit),
  emailContacto: e.emailContacto ?? '',
  esSocia: Boolean(e.esSocia),
  pendienteRevision: Boolean(e.pendienteRevision),
});
