import { Router } from 'express';
import { body } from 'express-validator';
import {
  listCapacitaciones,
  getCapacitacion,
  createCapacitacion,
  updateCapacitacion,
  deleteCapacitacion,
} from '../controllers/capacitacion.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { MODALIDADES, ESTADOS_CAPACITACION } from '../models/capacitacion.model.js';

const router = Router();

const optionalCost = (field) =>
  body(field)
    .optional({ values: 'null' })
    .isFloat({ min: 0 })
    .withMessage('El costo tiene que ser un número positivo.');

const commonRules = [
  body('fecha').optional().isISO8601().withMessage('La fecha no es válida.'),
  body('modalidad').optional().isIn(MODALIDADES).withMessage('Modalidad no válida.'),
  body('estado').optional().isIn(ESTADOS_CAPACITACION).withMessage('Estado no válido.'),
  body('linkVirtual').optional({ values: 'falsy' }).isURL().withMessage('El link de acceso virtual no es válido.'),
  optionalCost('costoSocios'),
  optionalCost('costoNoSocios'),
];

const createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('fecha').notEmpty().withMessage('La fecha es obligatoria.'),
  body('horaInicio').notEmpty().withMessage('El horario es obligatorio.'),
  ...commonRules,
];

const updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
  ...commonRules,
];

// TODO (próximo paso): proteger estas rutas con login de administración
router.get('/', listCapacitaciones);
router.get('/:id', getCapacitacion);
router.post('/', createRules, validate, createCapacitacion);
router.put('/:id', updateRules, validate, updateCapacitacion);
router.delete('/:id', deleteCapacitacion);

export default router;
