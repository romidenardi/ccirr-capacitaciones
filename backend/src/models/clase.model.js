import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

export const MODALIDADES = ['presencial', 'virtual', 'hibrida'];

// Cada encuentro de una capacitación, con su propia fecha, horario, modalidad y lugar.
// Una capacitación de un solo día tiene una sola clase.
const Clase = sequelize.define(
  'Clase',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    capacitacionId: { type: DataTypes.UUID, allowNull: false },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    horaInicio: { type: DataTypes.TIME, allowNull: false },
    horaFin: { type: DataTypes.TIME, allowNull: true },
    modalidad: { type: DataTypes.ENUM(...MODALIDADES), allowNull: false, defaultValue: 'presencial' },
    lugar: { type: DataTypes.STRING(200), allowNull: true },
    linkVirtual: { type: DataTypes.STRING(500), allowNull: true },
    // Opcionales: si una clase tiene un tema o un disertante distinto al general
    tema: { type: DataTypes.STRING(200), allowNull: true },
    disertante: { type: DataTypes.STRING(200), allowNull: true },
  },
  { tableName: 'clases' },
);

export default Clase;
