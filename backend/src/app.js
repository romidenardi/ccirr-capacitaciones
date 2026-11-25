import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import capacitacionRoutes from './routes/capacitacion.routes.js';
import empresaRoutes from './routes/empresa.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { sequelize } from './models/index.js';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());

// Estado del servidor, para el Healthcheck de Railway: si responde y llega a la base
app.get('/health', async (req, res) => {
  try {
    await sequelize.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', message: 'Sin conexión con la base de datos' });
  }
});

app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));
app.use(express.json({ limit: '1mb' }));
// En Express 5, un pedido sin cuerpo deja req.body en undefined: así siempre es un objeto
app.use((req, res, next) => {
  if (req.body === undefined || req.body === null) req.body = {};
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/capacitaciones', capacitacionRoutes);
app.use('/api/empresas', empresaRoutes);

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada.' }));
app.use(errorMiddleware);

export default app;
