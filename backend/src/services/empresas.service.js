import { Empresa } from '../models/index.js';

// Empresa de una inscripción a partir del CUIT: la existente o una nueva "a revisar".
// Si el nombre ya lo usa otra empresa (con otro CUIT), se le agrega el CUIT para no chocar.
export const empresaParaCuit = async ({ cuit, organizacion }, transaction) => {
  const existente = await Empresa.findOne({ where: { cuit }, transaction, lock: transaction.LOCK.UPDATE });
  if (existente) return existente;

  let nombre = organizacion;
  if (await Empresa.findOne({ where: { nombre }, transaction })) {
    nombre = `${organizacion} (CUIT ${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)})`;
  }
  return Empresa.create({ nombre, cuit, esSocia: false, pendienteRevision: true }, { transaction });
};
