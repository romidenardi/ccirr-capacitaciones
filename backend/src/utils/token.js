import jwt from 'jsonwebtoken';

// La sesión dura 8 horas: después hay que volver a ingresar
const DURACION = '8h';

export const firmarToken = (usuario, secreto = process.env.JWT_SECRET) =>
  jwt.sign({ id: usuario.id, nombre: usuario.nombre }, secreto, { expiresIn: DURACION });

// Devuelve los datos del token, o null si es inválido o venció
export const verificarToken = (token, secreto = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secreto);
  } catch {
    return null;
  }
};

// Saca el token del encabezado "Authorization: Bearer <token>"
export const leerToken = (header) => {
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
};
