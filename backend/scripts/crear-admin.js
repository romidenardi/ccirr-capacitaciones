import dotenv from 'dotenv';
dotenv.config();

import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { sequelize, Usuario } from '../src/models/index.js';
import { runMigrations } from '../src/db/migrations.js';

// Crea un usuario de administración, o le cambia la contraseña si el mail ya existe.
//   npm run crear-admin
const rl = readline.createInterface({ input: process.stdin });
const lineas = rl[Symbol.asyncIterator]();
const preguntar = async (texto) => {
  process.stdout.write(texto);
  const { value } = await lineas.next();
  return value ?? '';
};

try {
  await sequelize.authenticate();
  await runMigrations(sequelize, { log: () => {} });

  const nombre = (await preguntar('Nombre: ')).trim();
  const email = (await preguntar('Mail: ')).trim().toLowerCase();
  const password = await preguntar('Contraseña (mínimo 10 caracteres): ');

  if (!nombre || !email.includes('@')) throw new Error('Faltan el nombre o un mail válido.');
  if (password.length < 10) throw new Error('La contraseña tiene que tener al menos 10 caracteres.');

  const passwordHash = await bcrypt.hash(password, 12);
  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    await existente.update({ nombre, passwordHash, activo: true });
    console.log(`Listo: se actualizó la contraseña de ${email}.`);
  } else {
    await Usuario.create({ nombre, email, passwordHash });
    console.log(`Listo: se creó el usuario ${email}.`);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  await sequelize.close();
}
