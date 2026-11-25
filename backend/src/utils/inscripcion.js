// Reglas de la inscripción que no dependen de la base (para poder probarlas solas)

// Cuánto paga una persona según sea socia o no. null = sin costo.
export const montoAPagar = (capacitacion, esSocio) => {
  const costo = esSocio ? capacitacion.costoSocios : capacitacion.costoNoSocios;
  const numero = costo === null || costo === undefined ? 0 : Number(costo);
  return numero > 0 ? numero : null;
};

// Estado del pago al inscribirse: sin costo → no corresponde; con costo → pendiente (hasta que se confirme)
export const estadoPagoInicial = (monto) => (monto ? 'pendiente' : 'no_corresponde');

// Token del link personal de cada inscripción (64 caracteres al azar)
export const generarToken = (bytesAleatorios) => Buffer.from(bytesAleatorios).toString('hex');

// Estado del pago como se muestra en pantalla: separa "pendiente con comprobante" (hay que revisarlo)
// de "pendiente sin comprobante" (falta que la persona lo envíe)
export const ESTADOS_VISIBLES = {
  sin_costo: 'Sin costo',
  pendiente: 'Pendiente',
  revisar: 'Comprobante a revisar',
  confirmado: 'Confirmado',
  rechazado: 'Rechazado',
};

export const estadoPagoVisible = ({ estadoPago, comprobantePagoUrl }) => {
  if (estadoPago === 'no_corresponde') return 'sin_costo';
  if (estadoPago === 'pendiente') return comprobantePagoUrl ? 'revisar' : 'pendiente';
  return estadoPago;
};

// Resumen de asistencia de una persona: cuántas clases vino y si alcanza para el certificado
export const resumenAsistencia = (asistidas, totalClases, porcentajeMinimo) => {
  const requeridas = Math.ceil((totalClases * porcentajeMinimo) / 100);
  return { asistidas, totalClases, requeridas, cumple: totalClases > 0 && asistidas >= requeridas };
};
