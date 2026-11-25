import { Router } from 'express';
import { body } from 'express-validator';
import {
  listEmpresas,
  listRubros,
  getEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from '../controllers/empresa.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { cuitValido } from '../utils/cuit.js';

const router = Router();

const commonRules = [
  body('rubro').optional({ values: 'null' }).isLength({ max: 120 }).withMessage('El rubro es demasiado largo.'),
  body('cuit')
    .optional({ values: 'falsy' })
    .custom(cuitValido)
    .withMessage('El CUIT no es válido. Revisá los números.'),
  body('emailContacto').optional({ values: 'falsy' }).isEmail().withMessage('El mail de contacto no es válido.'),
  body(['esSocia', 'pendienteRevision']).optional().isBoolean().withMessage('Valor no válido.'),
];

const createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('nombre').isLength({ max: 200 }).withMessage('El nombre es demasiado largo.'),
  ...commonRules,
];

const updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
  ...commonRules,
];

// Gestión de empresas: solo administración
router.use(requireAuth);

router.get('/', listEmpresas);
router.get('/rubros', listRubros);
router.get('/:id', getEmpresa);
router.post('/', createRules, validate, createEmpresa);
router.put('/:id', updateRules, validate, updateEmpresa);
router.delete('/:id', deleteEmpresa);

export default router;
