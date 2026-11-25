import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { login, yo } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Freno a quien prueba contraseñas: 10 intentos cada 15 minutos por dirección IP
const limiteLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Esperá unos minutos y probá de nuevo.' },
});

const loginRules = [
  body('email').isEmail().withMessage('Escribí un mail válido.'),
  body('password').notEmpty().withMessage('Escribí la contraseña.'),
];

router.post('/login', limiteLogin, loginRules, validate, login);
router.get('/yo', requireAuth, yo);

export default router;
