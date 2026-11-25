import { Usuario } from '../models/index.js';
import { leerToken, verificarToken } from '../utils/token.js';

// Deja pasar solo a usuarios de administración con sesión válida. Queda en req.usuario.
export const requireAuth = async (req, res, next) => {
  const token = leerToken(req.headers.authorization);
  if (!token) return res.status(401).json({ message: 'Ingresá con tu usuario para continuar.' });

  const datos = verificarToken(token);
  if (!datos) return res.status(401).json({ message: 'Tu sesión venció. Ingresá de nuevo.' });

  try {
    // Se consulta la base en cada pedido: si se desactiva a alguien, pierde el acceso en el acto
    const usuario = await Usuario.findByPk(datos.id, { attributes: ['id', 'nombre', 'email', 'activo'] });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ message: 'Tu usuario no tiene acceso. Ingresá de nuevo.' });
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
};
