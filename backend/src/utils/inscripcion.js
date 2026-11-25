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
