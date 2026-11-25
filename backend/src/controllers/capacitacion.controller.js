import { Capacitacion, Material, Inscripcion } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pick } from '../utils/pick.js';
import { slugify } from '../utils/slug.js';
import { normalizarCapacitacion } from '../utils/normalizarCapacitacion.js';

const CAMPOS = [
  'nombre',
  'fecha',
  'horaInicio',
  'horaFin',
  'modalidad',
  'lugar',
  'linkVirtual',
  'temario',
  'disertantes',
  'exclusivoSocios',
  'costoSocios',
  'costoNoSocios',
  'entregaMaterial',
  'entregaCertificado',
  'cupo',
  'estado',
];

const findCapacitacion = async (id) => {
  const capacitacion = await Capacitacion.findByPk(id, { include: [{ model: Material, as: 'materiales' }] });
  if (!capacitacion) throw httpError('Capacitación no encontrada.', 404);
  return capacitacion;
};

// Slug único: si "taller-de-ventas" ya existe, prueba "taller-de-ventas-2", "-3"…
const uniqueSlug = async (nombre, excludeId) => {
  const base = slugify(nombre) || 'capacitacion';
  let slug = base;
  for (let n = 2; ; n += 1) {
    const existing = await Capacitacion.findOne({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
  }
};

export const listCapacitaciones = asyncHandler(async (req, res) => {
  const capacitaciones = await Capacitacion.findAll({
    order: [['fecha', 'DESC']],
    attributes: {
      include: [
        [
          Capacitacion.sequelize.literal(
            '(SELECT COUNT(*) FROM inscripciones WHERE inscripciones.capacitacion_id = Capacitacion.id)',
          ),
          'inscriptos',
        ],
      ],
    },
  });
  res.json(capacitaciones);
});

export const getCapacitacion = asyncHandler(async (req, res) => {
  res.json(await findCapacitacion(req.params.id));
});

export const createCapacitacion = asyncHandler(async (req, res) => {
  const data = normalizarCapacitacion(pick(req.body, CAMPOS));
  data.slug = await uniqueSlug(data.nombre);
  const capacitacion = await Capacitacion.create(data);
  res.status(201).json(capacitacion);
});

export const updateCapacitacion = asyncHandler(async (req, res) => {
  const capacitacion = await findCapacitacion(req.params.id);
  const data = normalizarCapacitacion(pick(req.body, CAMPOS), capacitacion);
  // El link público no cambia si ya hay inscriptos (lo pudieron haber compartido)
  if (data.nombre && data.nombre !== capacitacion.nombre) {
    const inscriptos = await Inscripcion.count({ where: { capacitacionId: capacitacion.id } });
    if (inscriptos === 0) data.slug = await uniqueSlug(data.nombre, capacitacion.id);
  }
  await capacitacion.update(data);
  res.json(capacitacion);
});

export const deleteCapacitacion = asyncHandler(async (req, res) => {
  const capacitacion = await findCapacitacion(req.params.id);
  const inscriptos = await Inscripcion.count({ where: { capacitacionId: capacitacion.id } });
  if (inscriptos > 0) {
    throw httpError('Tiene personas inscriptas: en lugar de eliminarla, cambiá su estado a "cancelada".', 409);
  }
  await capacitacion.destroy();
  res.status(204).end();
});
