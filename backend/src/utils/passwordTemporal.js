import crypto from 'node:crypto';

// Contraseña temporal fácil de dictar o copiar: 12 caracteres en tres grupos (ej. "k7mp-3xwa-9fhd").
// Sin letras ni números que se confunden (l, 1, i, o, 0).
const CARACTERES = 'abcdefghjkmnpqrstuvwxyz23456789';

export const generarPasswordTemporal = (azar = crypto.randomInt) => {
  const grupo = () => Array.from({ length: 4 }, () => CARACTERES[azar(CARACTERES.length)]).join('');
  return `${grupo()}-${grupo()}-${grupo()}`;
};

export const LARGO_MINIMO_PASSWORD = 10;
