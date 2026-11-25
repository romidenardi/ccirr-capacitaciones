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
import { requireAuth } from '../middlewares/auth.middleware.js';
import { MODALIDADES, ESTADOS_CAPACITACION } from '../models/capacitacion.model.js';

const router = Router();

const optionalCost = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('El costo tiene que ser un número positivo.');

const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

const commonRules = [
  body('horaInicio').optional().matches(HORA).withMessage('El horario de inicio no es válido.'),
  body('horaFin').optional({ values: 'falsy' }).matches(HORA).withMessage('El horario de fin no es válido.'),
  body('horaFin')
    .optional({ values: 'falsy' })
    .custom((fin, { req }) => !req.body.horaInicio || fin > req.body.horaInicio)
    .withMessage('El horario de fin tiene que ser posterior al de inicio.'),
  body('cupo').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('El cupo tiene que ser un número entero.'),
  body(['exclusivoSocios', 'entregaMaterial', 'entregaCertificado'])
    .optional()
    .isBoolean()
    .withMessage('Valor no válido.'),
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

// Todas las rutas de capacitaciones son de administración: piden sesión iniciada.
// (El formulario público de inscripción va a tener sus propias rutas, sin login.)
router.use(requireAuth);

router.get('/', listCapacitaciones);
router.get('/:id', getCapacitacion);
router.post('/', createRules, validate, createCapacitacion);
router.put('/:id', updateRules, validate, updateCapacitacion);
router.delete('/:id', deleteCapacitacion);

export default router;
