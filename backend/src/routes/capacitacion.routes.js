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
import { ESTADOS_CAPACITACION } from '../models/capacitacion.model.js';
import { MODALIDADES } from '../models/clase.model.js';

const router = Router();

const HORA = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

// "clases[1].fecha" → "Clase 2: …", para que el mensaje diga en qué clase está el problema
const enClase =
  (mensaje) =>
  (valor, { path }) => {
    const numero = Number(/\[(\d+)\]/.exec(path)?.[1] ?? 0) + 1;
    return `Clase ${numero}: ${mensaje}`;
  };

const optionalCost = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('El costo tiene que ser un número positivo.');

const clasesRules = [
  body('clases.*.fecha').isISO8601().withMessage(enClase('la fecha es obligatoria.')),
  body('clases.*.horaInicio').matches(HORA).withMessage(enClase('el horario de inicio es obligatorio.')),
  body('clases.*.horaFin')
    .optional({ values: 'falsy' })
    .matches(HORA)
    .withMessage(enClase('el horario de fin no es válido.')),
  body('clases.*')
    .custom((clase) => !clase.horaFin || !clase.horaInicio || clase.horaFin > clase.horaInicio)
    .withMessage(enClase('el horario de fin tiene que ser posterior al de inicio.')),
  body('clases.*.modalidad').optional().isIn(MODALIDADES).withMessage(enClase('modalidad no válida.')),
  body('clases.*.linkVirtual')
    .optional({ values: 'falsy' })
    .isURL()
    .withMessage(enClase('el link de acceso virtual no es válido.')),
];

const commonRules = [
  body('estado').optional().isIn(ESTADOS_CAPACITACION).withMessage('Estado no válido.'),
  body('cupo').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('El cupo tiene que ser un número entero.'),
  body('asistenciaMinima')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 100 })
    .withMessage('La asistencia mínima tiene que ser un porcentaje entre 1 y 100.'),
  body(['exclusivoSocios', 'entregaMaterial', 'entregaCertificado'])
    .optional()
    .isBoolean()
    .withMessage('Valor no válido.'),
  optionalCost('costoSocios'),
  optionalCost('costoNoSocios'),
  ...clasesRules,
];

const createRules = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio.'),
  body('clases').isArray({ min: 1 }).withMessage('Agregá al menos una clase.'),
  ...commonRules,
];

const updateRules = [
  body('nombre').optional().trim().notEmpty().withMessage('El nombre no puede quedar vacío.'),
  body('clases').optional().isArray({ min: 1 }).withMessage('La capacitación tiene que tener al menos una clase.'),
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
