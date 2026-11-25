import { Capacitacion, Clase, Material, Inscripcion, sequelize } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pick } from '../utils/pick.js';
import { slugify } from '../utils/slug.js';
import { normalizarCapacitacion, normalizarClase } from '../utils/normalizarCapacitacion.js';

const CAMPOS = [
  'nombre',
  'temario',
  'disertantes',
  'exclusivoSocios',
  'costoSocios',
  'costoNoSocios',
  'pagoObligatorio',
  'instruccionesPago',
  'entregaMaterial',
  'entregaCertificado',
  'asistenciaMinima',
  'cupo',
  'estado',
];

// Las clases siempre en orden cronológico
const ORDEN_CLASES = [
  [{ model: Clase, as: 'clases' }, 'fecha', 'ASC'],
  [{ model: Clase, as: 'clases' }, 'horaInicio', 'ASC'],
];

const findCapacitacion = async (id, transaction) => {
  const capacitacion = await Capacitacion.findByPk(id, {
    include: [
      { model: Clase, as: 'clases' },
      { model: Material, as: 'materiales' },
    ],
    order: ORDEN_CLASES,
    transaction,
  });
  if (!capacitacion) throw httpError('Capacitación no encontrada.', 404);
  return capacitacion;
};

// Slug único: si "taller-de-ventas" ya existe, prueba "taller-de-ventas-2", "-3"…
const uniqueSlug = async (nombre, excludeId, transaction) => {
  const base = slugify(nombre) || 'capacitacion';
  let slug = base;
  for (let n = 2; ; n += 1) {
    const existing = await Capacitacion.findOne({ where: { slug }, transaction });
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${n}`;
  }
};

// Sincroniza las clases de una capacitación con las que llegan del formulario:
// las que traen id se actualizan, las nuevas se crean y las que ya no están se borran.
// (Se conservan los id de las clases existentes: la asistencia se va a registrar por clase.)
const guardarClases = async (capacitacionId, clasesRecibidas, transaction) => {
  const clases = clasesRecibidas.map(normalizarClase);
  const existentes = await Clase.findAll({ where: { capacitacionId }, transaction });
  const idsExistentes = new Set(existentes.map((c) => c.id));

  for (const clase of clases) {
    if (clase.id && !idsExistentes.has(clase.id))
      throw httpError('Una de las clases no pertenece a esta capacitación.');
  }

  const idsRecibidos = new Set(clases.filter((c) => c.id).map((c) => c.id));
  for (const existente of existentes) {
    if (!idsRecibidos.has(existente.id)) await existente.destroy({ transaction });
  }

  for (const { id, ...datos } of clases) {
    if (id) {
      await Clase.update(datos, { where: { id, capacitacionId }, transaction });
    } else {
      await Clase.create({ ...datos, capacitacionId }, { transaction });
    }
  }
};

// Datos de resumen para el listado, calculados desde las clases
const sub = (sql) => Capacitacion.sequelize.literal(`(${sql} WHERE clases.capacitacion_id = Capacitacion.id)`);

export const listCapacitaciones = asyncHandler(async (req, res) => {
  const capacitaciones = await Capacitacion.findAll({
    attributes: {
      include: [
        [sub('SELECT MIN(fecha) FROM clases'), 'fechaInicio'],
        [sub('SELECT MAX(fecha) FROM clases'), 'fechaFin'],
        [sub('SELECT COUNT(*) FROM clases'), 'cantidadClases'],
        [sub('SELECT GROUP_CONCAT(DISTINCT modalidad) FROM clases'), 'modalidades'],
        [
          Capacitacion.sequelize.literal(
            '(SELECT COUNT(*) FROM inscripciones WHERE inscripciones.capacitacion_id = Capacitacion.id)',
          ),
          'inscriptos',
        ],
      ],
    },
    order: [[Capacitacion.sequelize.literal('fechaInicio'), 'DESC']],
  });
  res.json(capacitaciones);
});

export const getCapacitacion = asyncHandler(async (req, res) => {
  res.json(await findCapacitacion(req.params.id));
});

export const createCapacitacion = asyncHandler(async (req, res) => {
  const resultado = await sequelize.transaction(async (transaction) => {
    const data = normalizarCapacitacion(pick(req.body, CAMPOS));
    data.slug = await uniqueSlug(data.nombre, null, transaction);
    const capacitacion = await Capacitacion.create(data, { transaction });
    await guardarClases(capacitacion.id, req.body.clases, transaction);
    return findCapacitacion(capacitacion.id, transaction);
  });
  res.status(201).json(resultado);
});

export const updateCapacitacion = asyncHandler(async (req, res) => {
  const resultado = await sequelize.transaction(async (transaction) => {
    const capacitacion = await findCapacitacion(req.params.id, transaction);
    const data = normalizarCapacitacion(pick(req.body, CAMPOS), capacitacion);
    // El link público no cambia si ya hay inscriptos (lo pudieron haber compartido)
    if (data.nombre && data.nombre !== capacitacion.nombre) {
      const inscriptos = await Inscripcion.count({ where: { capacitacionId: capacitacion.id }, transaction });
      if (inscriptos === 0) data.slug = await uniqueSlug(data.nombre, capacitacion.id, transaction);
    }
    await capacitacion.update(data, { transaction });
    if (req.body.clases) await guardarClases(capacitacion.id, req.body.clases, transaction);
    return findCapacitacion(capacitacion.id, transaction);
  });
  res.json(resultado);
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
