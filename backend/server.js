import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { sequelize } from './src/models/index.js';
import { runMigrations } from './src/db/migrations.js';

const PORT = process.env.PORT || 3000;
const REQUIRED_ENV = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'APP_URL'];

let server = null;

// Cierre ordenado: Railway manda SIGTERM antes de reemplazar el servidor en cada deploy
const shutdown = async (signal) => {
  console.log(`[servidor] ${signal} recibido: cerrando…`);
  if (server) await new Promise((resolve) => server.close(resolve));
  await sequelize.close().catch(() => {});
  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

const start = async () => {
  try {
    const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
    if (missing.length > 0) {
      console.error('Faltan variables de entorno:', missing.join(', '));
      process.exit(1);
    }

    await sequelize.authenticate();
    console.log('Conexión a MySQL exitosa');

    // Cambios de base pendientes (carpeta migrations/): se aplican antes de atender pedidos
    await runMigrations(sequelize);

    server = app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error('Error al iniciar:', error.message);
    process.exit(1);
  }
};

start();
