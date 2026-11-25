import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

// Archivos o links que se comparten con los asistentes de una capacitación (puede haber varios)
const Material = sequelize.define(
  'Material',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    capacitacionId: { type: DataTypes.UUID, allowNull: false },
    titulo: { type: DataTypes.STRING(200), allowNull: false },
    url: { type: DataTypes.STRING(500), allowNull: false },
    tipo: { type: DataTypes.ENUM('archivo', 'link'), allowNull: false, defaultValue: 'archivo' },
  },
  { tableName: 'materiales' },
);

export default Material;
