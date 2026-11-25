import pkg from 'sequelize';
const { Op } = pkg;
import { Empresa, Inscripcion, Capacitacion } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { pick } from '../utils/pick.js';
import { soloDigitos } from '../utils/cuit.js';

const CAMPOS = ['nombre', 'rubro', 'cuit', 'emailContacto', 'esSocia', 'pendienteRevision'];

const textoOpcional = (valor) =>
  valor === null || valor === undefined || String(valor).trim() === '' ? null : String(valor).trim();

const normalizar = (datos) => {
  const limpio = { ...datos };
  if ('nombre' in limpio) limpio.nombre = String(limpio.nombre).trim().replace(/\s+/g, ' ');
  if ('rubro' in limpio) limpio.rubro = textoOpcional(limpio.rubro);
  if ('cuit' in limpio) limpio.cuit = soloDigitos(limpio.cuit) || null;
  if ('emailContacto' in limpio) limpio.emailContacto = textoOpcional(limpio.emailContacto)?.toLowerCase() ?? null;
  return limpio;
};

// Mensajes claros para los duplicados (antes de que la base los rechace)
const controlarDuplicados = async ({ nombre, cuit }, excluirId) => {
  const otra = (where) => Empresa.findOne({ where: excluirId ? { ...where, id: { [Op.ne]: excluirId } } : where });
  if (nombre) {
    const conNombre = await otra({ nombre });
    if (conNombre) throw httpError(`Ya existe una empresa con ese nombre: "${conNombre.nombre}".`, 409);
  }
  if (cuit) {
    const conCuit = await otra({ cuit });
    if (conCuit) throw httpError(`Ese CUIT ya está cargado en "${conCuit.nombre}".`, 409);
  }
};

const findEmpresa = async (id) => {
  const empresa = await Empresa.findByPk(id);
  if (!empresa) throw httpError('Empresa no encontrada.', 404);
  return empresa;
};

// Listado con búsqueda (?q=texto, busca en nombre, rubro y CUIT) y filtro (?socia=si|no|revisar)
export const listEmpresas = asyncHandler(async (req, res) => {
  const where = {};
  const q = String(req.query.q || '').trim();
  if (q) {
    const condiciones = [{ nombre: { [Op.like]: `%${q}%` } }, { rubro: { [Op.like]: `%${q}%` } }];
    const digitos = soloDigitos(q);
    if (digitos.length >= 3) condiciones.push({ cuit: { [Op.like]: `%${digitos}%` } });
    where[Op.or] = condiciones;
  }
  if (req.query.socia === 'si') where.esSocia = true;
  if (req.query.socia === 'no') where.esSocia = false;
  if (req.query.socia === 'revisar') {
    delete where.esSocia;
    where.pendienteRevision = true;
  }

  const empresas = await Empresa.findAll({
    where,
    attributes: {
      include: [
        [
          Empresa.sequelize.literal('(SELECT COUNT(*) FROM inscripciones WHERE inscripciones.empresa_id = Empresa.id)'),
          'inscriptos',
        ],
      ],
    },
    order: [['nombre', 'ASC']],
  });
  res.json(empresas);
});

// Rubros ya usados, para sugerirlos al cargar una empresa (y escribirlos siempre igual)
export const listRubros = asyncHandler(async (req, res) => {
  const filas = await Empresa.findAll({
    attributes: [[Empresa.sequelize.fn('DISTINCT', Empresa.sequelize.col('rubro')), 'rubro']],
    where: { rubro: { [Op.ne]: null } },
    order: [['rubro', 'ASC']],
    raw: true,
  });
  res.json(filas.map((f) => f.rubro));
});

// Una empresa con su personal inscripto y la capacitación de cada inscripción
export const getEmpresa = asyncHandler(async (req, res) => {
  const empresa = await findEmpresa(req.params.id);
  const inscripciones = await Inscripcion.findAll({
    where: { empresaId: empresa.id },
    attributes: ['id', 'nombre', 'apellido', 'cargo', 'email', 'estadoPago', 'createdAt'],
    include: [{ model: Capacitacion, attributes: ['id', 'nombre'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json({ ...empresa.toJSON(), inscripciones });
});

export const createEmpresa = asyncHandler(async (req, res) => {
  const data = normalizar(pick(req.body, CAMPOS));
  await controlarDuplicados(data);
  const empresa = await Empresa.create(data);
  res.status(201).json(empresa);
});

export const updateEmpresa = asyncHandler(async (req, res) => {
  const empresa = await findEmpresa(req.params.id);
  const data = normalizar(pick(req.body, CAMPOS));
  await controlarDuplicados(data, empresa.id);
  await empresa.update(data);
  res.json(empresa);
});

// Al borrar una empresa, sus inscripciones se conservan (con el nombre de organización que escribió cada
// persona), solo dejan de estar vinculadas a la empresa.
export const deleteEmpresa = asyncHandler(async (req, res) => {
  const empresa = await findEmpresa(req.params.id);
  await empresa.destroy();
  res.status(204).end();
});
