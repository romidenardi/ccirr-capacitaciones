import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { firmarToken } from '../utils/token.js';

const publico = (usuario) => ({ id: usuario.id, nombre: usuario.nombre, email: usuario.email });

export const login = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const usuario = await Usuario.findOne({ where: { email } });

  // Mismo mensaje si el mail no existe o la contraseña está mal: no revela qué mails están cargados
  const valido = usuario && usuario.activo && (await bcrypt.compare(req.body.password, usuario.passwordHash));
  if (!valido) throw httpError('El mail o la contraseña no son correctos.', 401);

  res.json({ token: firmarToken(usuario), usuario: publico(usuario) });
});

// Datos del usuario con la sesión actual (el frontend lo usa al recargar la página)
export const yo = asyncHandler(async (req, res) => {
  res.json(publico(req.usuario));
});
