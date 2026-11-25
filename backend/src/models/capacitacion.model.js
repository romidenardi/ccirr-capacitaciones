import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

export const ESTADOS_CAPACITACION = ['borrador', 'publicada', 'finalizada', 'cancelada'];

// Datos generales del curso. Las fechas, horarios, modalidad y lugar están en cada Clase.
// Costos: null = sin costo. Si costoSocios es null y costoNoSocios tiene valor, es gratis solo para socios.
const Capacitacion = sequelize.define(
  'Capacitacion',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    // Identificador legible para el link público de inscripción: /inscripcion/<slug>
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    temario: { type: DataTypes.TEXT, allowNull: true },
    disertantes: { type: DataTypes.TEXT, allowNull: true },
    exclusivoSocios: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    costoSocios: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    costoNoSocios: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    entregaMaterial: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    entregaCertificado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Porcentaje de clases al que hay que asistir para recibir el certificado (1 a 100)
    asistenciaMinima: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false, defaultValue: 75 },
    cupo: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
    estado: { type: DataTypes.ENUM(...ESTADOS_CAPACITACION), allowNull: false, defaultValue: 'borrador' },
  },
  { tableName: 'capacitaciones' },
);

export default Capacitacion;
