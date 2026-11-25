import crypto from 'node:crypto';
import { Capacitacion, Clase, Empresa, Inscripcion, sequelize } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { soloDigitos } from '../utils/cuit.js';
import { detectarTipo, guardarArchivo, borrarArchivo } from '../utils/archivos.js';
import { montoAPagar, estadoPagoInicial, generarToken } from '../utils/inscripcion.js';

// Lo que ve cualquier persona de una capacitación publicada. El link virtual NO se muestra acá:
// llega solo a las personas inscriptas (por mail y en su acceso personal).
const datosPublicos = (c, inscriptos) => ({
  nombre: c.nombre,
  slug: c.slug,
  temario: c.temario,
  disertantes: c.disertantes,
  exclusivoSocios: c.exclusivoSocios,
  costoSocios: c.costoSocios,
  costoNoSocios: c.costoNoSocios,
  pagoObligatorio: c.pagoObligatorio,
  instruccionesPago: c.instruccionesPago,
  entregaMaterial: c.entregaMaterial,
  entregaCertificado: c.entregaCertificado,
  cupoCompleto: Boolean(c.cupo) && inscriptos >= c.cupo,
  clases: c.clases.map((k) => ({
    fecha: k.fecha,
    horaInicio: k.horaInicio,
    horaFin: k.horaFin,
    modalidad: k.modalidad,
    lugar: k.lugar,
    tema: k.tema,
    disertante: k.disertante,
  })),
});

const buscarPublicada = async (slug, opciones = {}) => {
  const capacitacion = await Capacitacion.findOne({
    where: { slug, estado: 'publicada' },
    include: [{ model: Clase, as: 'clases' }],
    order: [
      [{ model: Clase, as: 'clases' }, 'fecha', 'ASC'],
      [{ model: Clase, as: 'clases' }, 'horaInicio', 'ASC'],
    ],
    ...opciones,
  });
  if (!capacitacion) throw httpError('Esta capacitación no está disponible para inscribirse.', 404);
  return capacitacion;
};

export const getCapacitacionPublica = asyncHandler(async (req, res) => {
  const capacitacion = await buscarPublicada(req.params.slug);
  const inscriptos = await Inscripcion.count({ where: { capacitacionId: capacitacion.id } });
  res.json(datosPublicos(capacitacion, inscriptos));
});

// Busca una organización por CUIT para completar el formulario. Solo con el CUIT exacto.
export const buscarEmpresaPorCuit = asyncHandler(async (req, res) => {
  const cuit = soloDigitos(req.params.cuit);
  const empresa = cuit.length === 11 ? await Empresa.findOne({ where: { cuit } }) : null;
  // Una empresa creada desde otra inscripción y todavía sin revisar no cuenta como socia
  if (!empresa) return res.json({ encontrada: false });
  res.json({ encontrada: true, nombre: empresa.nombre, esSocia: empresa.esSocia && !empresa.pendienteRevision });
});

// Empresa de la inscripción: la existente con ese CUIT o una nueva "a revisar".
// Si el nombre ya lo usa otra empresa (con otro CUIT), se le agrega el CUIT para no chocar.
const empresaParaCuit = async ({ cuit, organizacion }, transaction) => {
  const existente = await Empresa.findOne({ where: { cuit }, transaction, lock: transaction.LOCK.UPDATE });
  if (existente) return existente;

  let nombre = organizacion;
  if (await Empresa.findOne({ where: { nombre }, transaction })) {
    nombre = `${organizacion} (CUIT ${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)})`;
  }
  return Empresa.create({ nombre, cuit, esSocia: false, pendienteRevision: true }, { transaction });
};

export const crearInscripcion = asyncHandler(async (req, res) => {
  const b = req.body;

  // Campo trampa: invisible para las personas, solo lo completan los robots
  if (b.sitioWeb) throw httpError('No se pudo procesar la inscripción.');

  // El archivo se revisa antes de abrir la transacción
  let archivo = null;
  if (req.file) {
    archivo = detectarTipo(req.file.buffer);
    if (!archivo) throw httpError('El comprobante tiene que ser un PDF o una imagen (JPG, PNG o WEBP).');
  }

  let claveArchivo = null;
  try {
    const resultado = await sequelize.transaction(async (transaction) => {
      // Se bloquea la fila de la capacitación: dos inscripciones al mismo tiempo no pueden pasarse del cupo
      const capacitacion = await buscarPublicada(req.params.slug, { transaction, lock: transaction.LOCK.UPDATE });

      const email = b.email.trim().toLowerCase();
      const inscriptos = await Inscripcion.count({ where: { capacitacionId: capacitacion.id }, transaction });
      if (capacitacion.cupo && inscriptos >= capacitacion.cupo) {
        throw httpError('El cupo de esta capacitación está completo.', 409);
      }
      if (await Inscripcion.findOne({ where: { capacitacionId: capacitacion.id, email }, transaction })) {
        throw httpError('Ya hay una inscripción con ese mail en esta capacitación.', 409);
      }

      const cuit = soloDigitos(b.cuit);
      const organizacion = b.organizacion.trim().replace(/\s+/g, ' ');
      const empresa = await empresaParaCuit({ cuit, organizacion }, transaction);

      // Empresa ya verificada: manda lo que diga la base. Empresa nueva o a revisar: lo que declaró la persona.
      const verificada = !empresa.pendienteRevision;
      const esSocio = verificada ? empresa.esSocia : b.esSocio === 'true' || b.esSocio === true;

      if (capacitacion.exclusivoSocios && !esSocio) {
        throw httpError('Esta capacitación es exclusiva para socios del CCIRR.', 403);
      }

      const monto = montoAPagar(capacitacion, esSocio);
      if (monto && capacitacion.pagoObligatorio && !req.file) {
        throw httpError('Para inscribirte tenés que adjuntar el comprobante de pago.');
      }

      if (monto && req.file) claveArchivo = await guardarArchivo(req.file.buffer, 'comprobantes', archivo.ext);

      const opcional = (valor) => (valor && String(valor).trim() ? String(valor).trim() : null);
      const inscripcion = await Inscripcion.create(
        {
          capacitacionId: capacitacion.id,
          empresaId: empresa.id,
          nombre: b.nombre.trim(),
          apellido: b.apellido.trim(),
          organizacion: verificada ? empresa.nombre : organizacion,
          cuit,
          cargo: b.cargo.trim(),
          dni: opcional(b.dni),
          fechaNacimiento: opcional(b.fechaNacimiento),
          telefono: b.telefono.trim(),
          email,
          esSocio,
          monto,
          comoSeEntero: opcional(b.comoSeEntero),
          comprobantePagoUrl: claveArchivo,
          estadoPago: estadoPagoInicial(monto),
          tokenAcceso: generarToken(crypto.randomBytes(32)),
          consentimientoAt: new Date(),
        },
        { transaction },
      );

      return { capacitacion, inscripcion };
    });

    const { capacitacion, inscripcion } = resultado;
    res.status(201).json({
      nombre: inscripcion.nombre,
      email: inscripcion.email,
      capacitacion: datosPublicos(capacitacion, 0),
      monto: inscripcion.monto,
      estadoPago: inscripcion.estadoPago,
      comprobanteRecibido: Boolean(inscripcion.comprobantePagoUrl),
    });
  } catch (error) {
    // Si algo falló después de guardar el archivo, se borra para no dejar comprobantes sueltos
    await borrarArchivo(claveArchivo).catch(() => {});
    throw error;
  }
});
