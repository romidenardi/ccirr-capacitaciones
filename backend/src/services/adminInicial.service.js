import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';

// Primer usuario de administración en la nube, donde no se puede correr "npm run crear-admin".
// Solo actúa si la base NO tiene ningún usuario y están las dos variables ADMIN_INICIAL_EMAIL y
// ADMIN_INICIAL_PASSWORD. Una vez creado, esas variables se pueden (y conviene) borrar.
export const crearAdminInicial = async ({ env = process.env, log = console.log } = {}) => {
  const email = env.ADMIN_INICIAL_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_INICIAL_PASSWORD;
  if (!email || !password) return null;

  if ((await Usuario.count()) > 0) {
    log('[admin inicial] Ya hay usuarios: no se crea ninguno. Podés borrar las variables ADMIN_INICIAL_*.');
    return null;
  }
  if (password.length < 10) {
    log('[admin inicial] ADMIN_INICIAL_PASSWORD tiene que tener al menos 10 caracteres: no se creó el usuario.');
    return null;
  }

  const usuario = await Usuario.create({
    nombre: env.ADMIN_INICIAL_NOMBRE?.trim() || 'Administración',
    email,
    passwordHash: await bcrypt.hash(password, 12),
  });
  log(`[admin inicial] Usuario creado: ${email}. Ahora borrá las variables ADMIN_INICIAL_*.`);
  return usuario;
};
