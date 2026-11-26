import { Usuario } from '../models/index.js';
import { leerToken, verificarToken } from '../utils/token.js';

// Deja pasar solo a usuarios de administración con sesión válida. Queda en req.usuario.
// Quien tiene una contraseña temporal solo puede usar las rutas que permiten cambiarla.
const autenticar =
  ({ permitirPasswordTemporal = false } = {}) =>
  async (req, res, next) => {
    const token = leerToken(req.headers.authorization);
    if (!token) return res.status(401).json({ message: 'Ingresá con tu usuario para continuar.' });

    const datos = verificarToken(token);
    if (!datos) return res.status(401).json({ message: 'Tu sesión venció. Ingresá de nuevo.' });

    try {
      // Se consulta la base en cada pedido: si se desactiva a alguien o se le restablece la contraseña,
      // pierde el acceso en el acto (su sesión queda con una versión vieja)
      const usuario = await Usuario.findByPk(datos.id, {
        attributes: ['id', 'nombre', 'email', 'activo', 'debeCambiarPassword', 'sesionVersion'],
      });
      if (!usuario || !usuario.activo || (datos.v ?? 0) !== usuario.sesionVersion) {
        return res.status(401).json({ message: 'Tu sesión ya no es válida. Ingresá de nuevo.' });
      }
      if (usuario.debeCambiarPassword && !permitirPasswordTemporal) {
        return res
          .status(403)
          .json({ message: 'Antes de seguir, cambiá tu contraseña temporal.', codigo: 'CAMBIAR_PASSWORD' });
      }
      req.usuario = usuario;
      next();
    } catch (error) {
      next(error);
    }
  };

export const requireAuth = autenticar();
export const requireAuthConPasswordTemporal = autenticar({ permitirPasswordTemporal: true });
