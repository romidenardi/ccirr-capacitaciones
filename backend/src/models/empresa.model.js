import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

// Las personas inscriptas de cada empresa salen de la relación Empresa → Inscripciones (ver index.js)
const Empresa = sequelize.define(
  'Empresa',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    rubro: { type: DataTypes.STRING(120), allowNull: true },
    esSocia: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'empresas' },
);

export default Empresa;
