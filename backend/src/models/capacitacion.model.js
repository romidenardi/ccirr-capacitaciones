import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

export const MODALIDADES = ['presencial', 'virtual', 'hibrida'];
export const ESTADOS_CAPACITACION = ['borrador', 'publicada', 'finalizada', 'cancelada'];

// Costos: null = sin costo. Si costoSocios es null y costoNoSocios tiene valor, es gratis solo para socios.
const Capacitacion = sequelize.define(
  'Capacitacion',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    // Identificador legible para el link público de inscripción: /inscripcion/<slug>
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    fecha: { type: DataTypes.DATEONLY, allowNull: false },
    horaInicio: { type: DataTypes.TIME, allowNull: false },
    horaFin: { type: DataTypes.TIME, allowNull: true },
    modalidad: { type: DataTypes.ENUM(...MODALIDADES), allowNull: false, defaultValue: 'presencial' },
    lugar: { type: DataTypes.STRING(200), allowNull: true },
    linkVirtual: { type: DataTypes.STRING(500), allowNull: true },
    temario: { type: DataTypes.TEXT, allowNull: true },
    disertantes: { type: DataTypes.TEXT, allowNull: true },
    exclusivoSocios: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    costoSocios: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    costoNoSocios: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    entregaMaterial: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    entregaCertificado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    cupo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    estado: { type: DataTypes.ENUM(...ESTADOS_CAPACITACION), allowNull: false, defaultValue: 'borrador' },
  },
  { tableName: 'capacitaciones' },
);

export default Capacitacion;
