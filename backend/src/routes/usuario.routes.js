import { Router } from 'express';
import { body } from 'express-validator';
import { listUsuarios, createUsuario, updateUsuario, restablecerPassword } from '../controllers/usuario.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

// Gestión de usuarios de administración. Todos los usuarios activos pueden gestionar a los demás.
const router = Router();

router.use(requireAuth);

router.get('/', listUsuarios);
router.post(
  '/',
  [
    body('nombre').trim().notEmpty().withMessage('Escribí el nombre.').isLength({ max: 120 }),
    body('email').trim().isEmail().withMessage('Escribí un mail válido.').isLength({ max: 200 }),
  ],
  validate,
  createUsuario,
);
router.put(
  '/:id',
  [
    body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
    body('activo').optional().isBoolean().withMessage('Valor no válido.'),
  ],
  validate,
  updateUsuario,
);
router.post('/:id/restablecer-password', restablecerPassword);

export default router;
