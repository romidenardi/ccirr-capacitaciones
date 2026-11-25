import crypto from 'node:crypto';
import pkg from 'sequelize';
const { Op } = pkg;
import { Asistencia, Capacitacion, Clase, Empresa, Inscripcion, sequelize } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pick } from '../utils/pick.js';
import { soloDigitos } from '../utils/cuit.js';
import { detectarTipo, guardarArchivo, borrarArchivo, rutaDeClave } from '../utils/archivos.js';
import {
  montoAPagar,
  estadoPagoInicial,
  estadoPagoVisible,
  generarToken,
  resumenAsistencia,
} from '../utils/inscripcion.js';
import { empresaParaCuit } from '../services/empresas.service.js';
import { generarExcelInscriptos } from '../services/excel.service.js';

// ---------- Ayudas ----------

const ORDEN_CLASES = [
  ['fecha', 'ASC'],
  ['horaInicio', 'ASC'],
];

const buscarCapacitacion = async (id) => {
  const capacitacion = await Capacitacion.findByPk(id, {
    attributes: ['id', 'nombre', 'asistenciaMinima', 'entregaCertificado', 'cupo', 'costoSocios', 'costoNoSocios'],
  });
  if (!capacitacion) throw httpError('Capacitación no encontrada.', 404);
  const clases = await Clase.findAll({
    where: { capacitacionId: id },
    attributes: ['id', 'fecha', 'horaInicio'],
    order: ORDEN_CLASES,
  });
  return { capacitacion, clases };
};

const buscarInscripcion = async (id) => {
  const inscripcion = await Inscripcion.findByPk(id, {
    include: [
      { model: Empresa, attributes: ['id', 'nombre', 'pendienteRevision', 'esSocia'] },
      { model: Asistencia, as: 'asistencias', attributes: ['claseId'] },
    ],
  });
  if (!inscripcion) throw httpError('Inscripción no encontrada.', 404);
  return inscripcion;
};

// Lo que se envía a la pantalla: sin el token de acceso ni la ruta interna del archivo
const aRespuesta = (inscripcion, { clases, capacitacion }) => {
  const datos = inscripcion.toJSON();
  const asistidas = (datos.asistencias || []).map((a) => a.claseId);
  const { tokenAcceso, comprobantePagoUrl, asistencias, Empresa: empresa, ...resto } = datos;
  return {
    ...resto,
    empresa: empresa || null,
    tieneComprobante: Boolean(comprobantePagoUrl),
    estadoVisible: estadoPagoVisible(datos),
    clasesAsistidas: asistidas,
    asistencia: resumenAsistencia(asistidas.length, clases.length, capacitacion.asistenciaMinima),
  };
};

// Filtro por estado de pago "visible" → condición para la base
const FILTROS_PAGO = {
  sin_costo: { estadoPago: 'no_corresponde' },
  pendiente: { estadoPago: 'pendiente', comprobantePagoUrl: null },
  revisar: { estadoPago: 'pendiente', comprobantePagoUrl: { [Op.ne]: null } },
  confirmado: { estadoPago: 'confirmado' },
  rechazado: { estadoPago: 'rechazado' },
};

const listar = async (capacitacionId, { q = '', pago = '' } = {}) => {
  const where = { capacitacionId, ...(FILTROS_PAGO[pago] || {}) };
  const texto = String(q).trim();
  if (texto) {
    where[Op.or] = ['nombre', 'apellido', 'email', 'organizacion', 'dni'].map((campo) => ({
      [campo]: { [Op.like]: `%${texto}%` },
    }));
  }
  return Inscripcion.findAll({
    where,
    include: [
      { model: Empresa, attributes: ['id', 'nombre', 'pendienteRevision', 'esSocia'] },
      { model: Asistencia, as: 'asistencias', attributes: ['claseId'] },
    ],
    order: [
      ['apellido', 'ASC'],
      ['nombre', 'ASC'],
    ],
  });
};

const opcional = (valor) =>
  valor === undefined ? undefined : valor && String(valor).trim() ? String(valor).trim() : null;

// ---------- Listado y detalle ----------

export const listInscripciones = asyncHandler(async (req, res) => {
  const contexto = await buscarCapacitacion(req.params.capacitacionId);
  const inscripciones = await listar(contexto.capacitacion.id, req.query);
  const total = await Inscripcion.count({ where: { capacitacionId: contexto.capacitacion.id } });
  res.json({
    capacitacion: { ...contexto.capacitacion.toJSON(), clases: contexto.clases, inscriptos: total },
    inscripciones: inscripciones.map((i) => aRespuesta(i, contexto)),
  });
});

export const getInscripcion = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  const contexto = await buscarCapacitacion(inscripcion.capacitacionId);
  res.json({ ...aRespuesta(inscripcion, contexto), capacitacion: contexto.capacitacion });
});

// ---------- Alta manual (desde administración) ----------
// A diferencia del formulario público: el CUIT es opcional, no controla cupo ni exclusividad
// (lo decide quien administra) y no registra consentimiento (se obtuvo por otra vía).

export const createInscripcion = asyncHandler(async (req, res) => {
  const b = req.body;
  const resultado = await sequelize.transaction(async (transaction) => {
    const capacitacion = await Capacitacion.findByPk(req.params.capacitacionId, { transaction });
    if (!capacitacion) throw httpError('Capacitación no encontrada.', 404);

    const email = b.email.trim().toLowerCase();
    if (await Inscripcion.findOne({ where: { capacitacionId: capacitacion.id, email }, transaction })) {
      throw httpError('Ya hay una inscripción con ese mail en esta capacitación.', 409);
    }

    const cuit = soloDigitos(b.cuit) || null;
    const organizacion = b.organizacion.trim().replace(/\s+/g, ' ');
    const empresa = cuit ? await empresaParaCuit({ cuit, organizacion }, transaction) : null;
    const verificada = empresa && !empresa.pendienteRevision;
    const esSocio = verificada ? empresa.esSocia : Boolean(b.esSocio);
    const monto = montoAPagar(capacitacion, esSocio);

    return Inscripcion.create(
      {
        capacitacionId: capacitacion.id,
        empresaId: empresa?.id ?? null,
        nombre: b.nombre.trim(),
        apellido: b.apellido.trim(),
        organizacion: verificada ? empresa.nombre : organizacion,
        cuit,
        cargo: opcional(b.cargo) || '-',
        dni: opcional(b.dni),
        fechaNacimiento: opcional(b.fechaNacimiento),
        telefono: opcional(b.telefono) || '-',
        email,
        esSocio,
        monto,
        comoSeEntero: opcional(b.comoSeEntero),
        estadoPago: estadoPagoInicial(monto),
        tokenAcceso: generarToken(crypto.randomBytes(32)),
      },
      { transaction },
    );
  });
  res.status(201).json({ id: resultado.id });
});

// ---------- Edición ----------

const CAMPOS_EDITABLES = [
  'nombre',
  'apellido',
  'organizacion',
  'cargo',
  'dni',
  'fechaNacimiento',
  'telefono',
  'email',
  'esSocio',
  'monto',
  'comoSeEntero',
  'empresaId',
];

export const updateInscripcion = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  const data = pick(req.body, CAMPOS_EDITABLES);

  for (const campo of ['dni', 'fechaNacimiento', 'comoSeEntero'])
    if (campo in data) data[campo] = opcional(data[campo]);
  for (const campo of ['nombre', 'apellido', 'organizacion', 'cargo', 'telefono']) {
    if (campo in data) data[campo] = String(data[campo]).trim();
  }
  if ('email' in data) {
    data.email = data.email.trim().toLowerCase();
    const otra = await Inscripcion.findOne({
      where: { capacitacionId: inscripcion.capacitacionId, email: data.email, id: { [Op.ne]: inscripcion.id } },
    });
    if (otra) throw httpError('Ya hay otra inscripción con ese mail en esta capacitación.', 409);
  }
  if ('empresaId' in data) {
    data.empresaId = data.empresaId || null;
    if (data.empresaId && !(await Empresa.findByPk(data.empresaId))) throw httpError('La empresa no existe.');
  }

  // El monto manda sobre el estado: sin monto no hay pago; con monto, un "sin costo" pasa a pendiente
  if ('monto' in data) {
    data.monto = data.monto === '' || data.monto === null || Number(data.monto) === 0 ? null : Number(data.monto);
    if (!data.monto) {
      data.estadoPago = 'no_corresponde';
      data.motivoRechazo = null;
    } else if (inscripcion.estadoPago === 'no_corresponde') {
      data.estadoPago = 'pendiente';
    }
  }

  await inscripcion.update(data);
  const contexto = await buscarCapacitacion(inscripcion.capacitacionId);
  res.json(aRespuesta(await buscarInscripcion(inscripcion.id), contexto));
});

export const deleteInscripcion = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  const archivo = inscripcion.comprobantePagoUrl;
  await inscripcion.destroy();
  await borrarArchivo(archivo).catch(() => {});
  res.status(204).end();
});

// ---------- Pago ----------

export const cambiarPago = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  if (!inscripcion.monto) throw httpError('Esta inscripción no tiene costo.');

  const { accion, motivo } = req.body;
  if (accion === 'confirmar') await inscripcion.update({ estadoPago: 'confirmado', motivoRechazo: null });
  if (accion === 'rechazar') {
    await inscripcion.update({ estadoPago: 'rechazado', motivoRechazo: opcional(motivo) || null });
  }
  if (accion === 'pendiente') await inscripcion.update({ estadoPago: 'pendiente', motivoRechazo: null });

  const contexto = await buscarCapacitacion(inscripcion.capacitacionId);
  res.json(aRespuesta(await buscarInscripcion(inscripcion.id), contexto));
});

// Comprobante recibido por otra vía (mail, WhatsApp): se adjunta desde administración
export const subirComprobante = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  if (!req.file) throw httpError('Elegí un archivo.');
  const tipo = detectarTipo(req.file.buffer);
  if (!tipo) throw httpError('El comprobante tiene que ser un PDF o una imagen (JPG, PNG o WEBP).');

  const anterior = inscripcion.comprobantePagoUrl;
  const clave = await guardarArchivo(req.file.buffer, 'comprobantes', tipo.ext);
  const cambios = { comprobantePagoUrl: clave };
  if (inscripcion.estadoPago === 'rechazado') Object.assign(cambios, { estadoPago: 'pendiente', motivoRechazo: null });
  await inscripcion.update(cambios);
  await borrarArchivo(anterior).catch(() => {});

  const contexto = await buscarCapacitacion(inscripcion.capacitacionId);
  res.json(aRespuesta(await buscarInscripcion(inscripcion.id), contexto));
});

export const verComprobante = asyncHandler(async (req, res) => {
  const inscripcion = await buscarInscripcion(req.params.id);
  if (!inscripcion.comprobantePagoUrl) throw httpError('Esta inscripción no tiene comprobante.', 404);
  const nombre = `comprobante-${inscripcion.apellido}-${inscripcion.nombre}`.replace(/[^\w-]+/g, '_');
  const ext = inscripcion.comprobantePagoUrl.split('.').pop();
  res.setHeader('Content-Disposition', `inline; filename="${nombre}.${ext}"`);
  res.sendFile(rutaDeClave(inscripcion.comprobantePagoUrl), (error) => {
    if (error && !res.headersSent) res.status(404).json({ message: 'No se encontró el archivo del comprobante.' });
  });
});

// ---------- Asistencia ----------
// { inscripcionId, claseId, presente } marca o desmarca a una persona en una clase.
// { claseId, presente, todos: true } marca o desmarca a todas las personas en esa clase.

export const marcarAsistencia = asyncHandler(async (req, res) => {
  const { capacitacionId } = req.params;
  const { inscripcionId, claseId, presente, todos } = req.body;

  const clase = await Clase.findOne({ where: { id: claseId, capacitacionId } });
  if (!clase) throw httpError('La clase no pertenece a esta capacitación.');

  const inscripciones = todos
    ? await Inscripcion.findAll({ where: { capacitacionId }, attributes: ['id'] })
    : await Inscripcion.findAll({ where: { id: inscripcionId, capacitacionId }, attributes: ['id'] });
  if (!inscripciones.length && !todos) throw httpError('La inscripción no pertenece a esta capacitación.');

  const ids = inscripciones.map((i) => i.id);
  if (presente) {
    const yaMarcadas = new Set(
      (await Asistencia.findAll({ where: { claseId, inscripcionId: ids }, attributes: ['inscripcionId'] })).map(
        (a) => a.inscripcionId,
      ),
    );
    const nuevas = ids.filter((id) => !yaMarcadas.has(id)).map((id) => ({ inscripcionId: id, claseId }));
    if (nuevas.length) await Asistencia.bulkCreate(nuevas, { ignoreDuplicates: true });
  } else if (ids.length) {
    await Asistencia.destroy({ where: { claseId, inscripcionId: ids } });
  }
  res.json({ ok: true, cantidad: ids.length });
});

// ---------- Exportar ----------

export const exportarInscriptos = asyncHandler(async (req, res) => {
  const contexto = await buscarCapacitacion(req.params.capacitacionId);
  const inscripciones = (await listar(contexto.capacitacion.id)).map((i) => aRespuesta(i, contexto));
  const libro = await generarExcelInscriptos({ ...contexto, inscripciones });

  const nombre = `inscriptos-${contexto.capacitacion.nombre}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w-]+/g, '-')
    .slice(0, 80);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${nombre}.xlsx"`);
  await libro.xlsx.write(res);
  res.end();
});
