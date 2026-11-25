import { Router } from 'express';
import { body } from 'express-validator';
import {
  listInscripciones,
  getInscripcion,
  createInscripcion,
  updateInscripcion,
  deleteInscripcion,
  cambiarPago,
  subirComprobante,
  verComprobante,
  marcarAsistencia,
  exportarInscriptos,
} from '../controllers/inscripcion.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { subirComprobante as recibirArchivo } from '../config/multer.js';
import { cuitValido } from '../utils/cuit.js';
import { CANALES } from '../models/inscripcion.model.js';

// Gestión de inscriptos (administración). Cada ruta pide sesión.
const router = Router();

const datosRules = (obligatorio) => {
  const campo = (nombre, mensaje) =>
    obligatorio
      ? body(nombre).trim().notEmpty().withMessage(mensaje)
      : body(nombre).optional().trim().notEmpty().withMessage(mensaje);
  return [
    campo('nombre', 'Escribí el nombre.'),
    campo('apellido', 'Escribí el apellido.'),
    campo('organizacion', 'Escribí la organización.'),
    (obligatorio ? body('email') : body('email').optional()).trim().isEmail().withMessage('Escribí un mail válido.'),
    body('cuit').optional({ values: 'falsy' }).custom(cuitValido).withMessage('El CUIT no es válido.'),
    body('dni')
      .optional({ values: 'falsy' })
      .matches(/^\d{7,9}$/)
      .withMessage('El DNI tiene que tener solo números (7 u 8 dígitos).'),
    body('fechaNacimiento')
      .optional({ values: 'falsy' })
      .isISO8601()
      .withMessage('La fecha de nacimiento no es válida.'),
    body('comoSeEntero').optional({ values: 'falsy' }).isIn(CANALES).withMessage('Opción no válida.'),
    body('esSocio').optional().isBoolean().withMessage('Valor no válido.'),
    body('monto')
      .optional({ values: 'falsy' })
      .isFloat({ min: 0 })
      .withMessage('El monto tiene que ser un número positivo.'),
  ];
};

const pagoRules = [
  body('accion').isIn(['confirmar', 'rechazar', 'pendiente']).withMessage('Acción no válida.'),
  body('motivo').optional({ values: 'falsy' }).isLength({ max: 500 }).withMessage('El motivo es demasiado largo.'),
];

const asistenciaRules = [
  body('claseId').notEmpty().withMessage('Falta la clase.'),
  body('presente').isBoolean().withMessage('Valor no válido.'),
];

router.get('/capacitaciones/:capacitacionId/inscripciones', requireAuth, listInscripciones);
router.get('/capacitaciones/:capacitacionId/inscripciones/excel', requireAuth, exportarInscriptos);
router.post(
  '/capacitaciones/:capacitacionId/inscripciones',
  requireAuth,
  datosRules(true),
  validate,
  createInscripcion,
);
router.put('/capacitaciones/:capacitacionId/asistencias', requireAuth, asistenciaRules, validate, marcarAsistencia);

router.get('/inscripciones/:id', requireAuth, getInscripcion);
router.put('/inscripciones/:id', requireAuth, datosRules(false), validate, updateInscripcion);
router.delete('/inscripciones/:id', requireAuth, deleteInscripcion);
router.post('/inscripciones/:id/pago', requireAuth, pagoRules, validate, cambiarPago);
router.post('/inscripciones/:id/comprobante', requireAuth, recibirArchivo, subirComprobante);
router.get('/inscripciones/:id/comprobante', requireAuth, verComprobante);

export default router;
