import dotenv from 'dotenv';
dotenv.config();

import { sequelize } from '../src/models/index.js';
import { runMigrations } from '../src/db/migrations.js';

// Aplica las migraciones pendientes sin levantar el servidor (el servidor también lo hace al arrancar)
try {
  await sequelize.authenticate();
  const { fresh, applied } = await runMigrations(sequelize);
  if (!fresh) console.log(applied.length ? `Listo: ${applied.length} aplicadas.` : 'Nada que aplicar.');
} catch (error) {
  console.error('Error:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
