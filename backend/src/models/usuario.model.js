import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

// Personas del CCIRR que administran la plataforma. La contraseña se guarda cifrada (nunca en texto)
const Usuario = sequelize.define(
  'Usuario',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(200), allowNull: false, unique: true, validate: { isEmail: true } },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    // Contraseña temporal (creada o restablecida por otra persona): hay que cambiarla al ingresar
    debeCambiarPassword: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Sube al cambiar o restablecer la contraseña y al desactivar: invalida las sesiones abiertas
    sesionVersion: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    ultimoIngreso: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'usuarios' },
);

export default Usuario;
