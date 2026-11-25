// Conversión entre los datos de una capacitación (como los devuelve el backend) y el formulario.
// En el formulario todo es texto o sí/no: un campo vacío es '' (el backend lo guarda como null).

export const VALORES_INICIALES = {
  nombre: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  modalidad: 'presencial',
  lugar: '',
  linkVirtual: '',
  temario: '',
  disertantes: '',
  exclusivoSocios: false,
  costoSocios: '',
  costoNoSocios: '',
  entregaMaterial: false,
  entregaCertificado: false,
  cupo: '',
  estado: 'borrador',
};

const texto = (valor) => (valor === null || valor === undefined ? '' : String(valor));
const hora = (valor) => texto(valor).slice(0, 5); // "18:30:00" → "18:30"
const numero = (valor) => (valor === null || valor === undefined ? '' : String(Number(valor))); // "15000.00" → "15000"

export const aFormulario = (c) => ({
  ...VALORES_INICIALES,
  nombre: texto(c.nombre),
  fecha: texto(c.fecha),
  horaInicio: hora(c.horaInicio),
  horaFin: hora(c.horaFin),
  modalidad: c.modalidad || 'presencial',
  lugar: texto(c.lugar),
  linkVirtual: texto(c.linkVirtual),
  temario: texto(c.temario),
  disertantes: texto(c.disertantes),
  exclusivoSocios: Boolean(c.exclusivoSocios),
  costoSocios: numero(c.costoSocios),
  costoNoSocios: numero(c.costoNoSocios),
  entregaMaterial: Boolean(c.entregaMaterial),
  entregaCertificado: Boolean(c.entregaCertificado),
  cupo: numero(c.cupo),
  estado: c.estado || 'borrador',
});

export const usaLugar = (modalidad) => modalidad === 'presencial' || modalidad === 'hibrida';
export const usaLink = (modalidad) => modalidad === 'virtual' || modalidad === 'hibrida';

export const linkInscripcion = (slug, origen = window.location.origin) => `${origen}/inscripcion/${slug}`;
