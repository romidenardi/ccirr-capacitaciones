import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

// Una fila por cada clase a la que asistió una persona inscripta (si no hay fila, no asistió)
const Asistencia = sequelize.define(
  'Asistencia',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    inscripcionId: { type: DataTypes.UUID, allowNull: false },
    claseId: { type: DataTypes.UUID, allowNull: false },
  },
  {
    tableName: 'asistencias',
    indexes: [{ unique: true, fields: ['inscripcion_id', 'clase_id'] }],
  },
);

export default Asistencia;
