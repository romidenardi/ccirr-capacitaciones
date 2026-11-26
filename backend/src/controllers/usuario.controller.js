import bcrypt from 'bcryptjs';
import { Usuario } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { generarPasswordTemporal } from '../utils/passwordTemporal.js';

// Usuarios de administración. La contraseña temporal se devuelve UNA sola vez (al crear o restablecer):
// en la base queda solo cifrada, así que no se puede volver a consultar.

const ATRIBUTOS = ['id', 'nombre', 'email', 'activo', 'debeCambiarPassword', 'ultimoIngreso', 'createdAt'];
const publico = (u) => Object.fromEntries(ATRIBUTOS.map((a) => [a, u[a]]));

const buscar = async (id) => {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw httpError('Usuario no encontrado.', 404);
  return usuario;
};

export const listUsuarios = asyncHandler(async (req, res) => {
  const usuarios = await Usuario.findAll({ attributes: ATRIBUTOS, order: [['nombre', 'ASC']] });
  res.json(usuarios);
});

export const createUsuario = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  if (await Usuario.findOne({ where: { email } })) throw httpError('Ya hay un usuario con ese mail.', 409);

  const passwordTemporal = generarPasswordTemporal();
  const usuario = await Usuario.create({
    nombre: req.body.nombre.trim(),
    email,
    passwordHash: await bcrypt.hash(passwordTemporal, 12),
    debeCambiarPassword: true,
  });
  res.status(201).json({ usuario: publico(usuario), passwordTemporal });
});

// Cambia el nombre o activa/desactiva. Nadie puede desactivarse a sí mismo.
export const updateUsuario = asyncHandler(async (req, res) => {
  const usuario = await buscar(req.params.id);
  const cambios = {};
  if (req.body.nombre !== undefined) cambios.nombre = req.body.nombre.trim();
  if (req.body.activo !== undefined && req.body.activo !== usuario.activo) {
    if (usuario.id === req.usuario.id) throw httpError('No podés desactivar tu propio usuario.');
    cambios.activo = req.body.activo;
    // Al desactivar, se cierran sus sesiones abiertas
    if (!req.body.activo) cambios.sesionVersion = usuario.sesionVersion + 1;
  }
  await usuario.update(cambios);
  res.json(publico(usuario));
});

// Nueva contraseña temporal (para quien la olvidó). Cierra sus sesiones abiertas.
export const restablecerPassword = asyncHandler(async (req, res) => {
  const usuario = await buscar(req.params.id);
  if (usuario.id === req.usuario.id) throw httpError('Para tu propia contraseña usá «Mi contraseña».');
  const passwordTemporal = generarPasswordTemporal();
  await usuario.update({
    passwordHash: await bcrypt.hash(passwordTemporal, 12),
    debeCambiarPassword: true,
    sesionVersion: usuario.sesionVersion + 1,
  });
  res.json({ usuario: publico(usuario), passwordTemporal });
});
