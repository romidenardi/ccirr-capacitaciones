import { Router } from 'express';
import { body, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { getCapacitacionPublica, buscarEmpresaPorCuit, crearInscripcion } from '../controllers/publico.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { subirComprobante } from '../config/multer.js';
import { cuitValido } from '../utils/cuit.js';
import { CANALES } from '../models/inscripcion.model.js';

// Rutas sin login: las usa el formulario público de inscripción
const router = Router();

const limite = (cantidad, minutos, mensaje) =>
  rateLimit({
    windowMs: minutos * 60 * 1000,
    limit: cantidad,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: mensaje },
  });

// Una misma conexión: hasta 10 inscripciones por hora y 60 búsquedas de CUIT cada 15 minutos
const limiteInscripciones = limite(
  10,
  60,
  'Se hicieron demasiadas inscripciones desde esta conexión. Probá más tarde.',
);
const limiteCuit = limite(60, 15, 'Demasiadas búsquedas. Esperá unos minutos.');

const inscripcionRules = [
  body('nombre').trim().notEmpty().withMessage('Escribí tu nombre.').isLength({ max: 100 }),
  body('apellido').trim().notEmpty().withMessage('Escribí tu apellido.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Escribí un mail válido.').isLength({ max: 200 }),
  body('telefono').trim().notEmpty().withMessage('Escribí un teléfono.').isLength({ max: 40 }),
  body('cuit').custom(cuitValido).withMessage('El CUIT no es válido. Revisá los números.'),
  body('organizacion').trim().notEmpty().withMessage('Escribí el nombre de la organización.').isLength({ max: 200 }),
  body('cargo').trim().notEmpty().withMessage('Escribí tu cargo.').isLength({ max: 120 }),
  body('dni')
    .optional({ values: 'falsy' })
    .matches(/^\d{7,9}$/)
    .withMessage('El DNI tiene que tener solo números (7 u 8 dígitos).'),
  body('fechaNacimiento').optional({ values: 'falsy' }).isISO8601().withMessage('La fecha de nacimiento no es válida.'),
  body('comoSeEntero').optional({ values: 'falsy' }).isIn(CANALES).withMessage('Opción no válida.'),
  body('consentimiento').equals('true').withMessage('Tenés que aceptar el uso de tus datos para inscribirte.'),
];

router.get('/capacitaciones/:slug', getCapacitacionPublica);
router.get('/empresas/cuit/:cuit', limiteCuit, param('cuit').isLength({ max: 20 }), validate, buscarEmpresaPorCuit);
router.post(
  '/capacitaciones/:slug/inscripciones',
  limiteInscripciones,
  subirComprobante,
  inscripcionRules,
  validate,
  crearInscripcion,
);

export default router;
