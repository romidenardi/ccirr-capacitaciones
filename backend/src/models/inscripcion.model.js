import pkg from 'sequelize';
const { DataTypes } = pkg;
import sequelize from '../config/database.js';

export const CANALES = ['mail', 'whatsapp', 'web', 'redes', 'colega', 'otro'];
// no_corresponde: capacitación sin costo para esta persona
export const ESTADOS_PAGO = ['no_corresponde', 'pendiente', 'confirmado', 'rechazado'];

const Inscripcion = sequelize.define(
  'Inscripcion',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    capacitacionId: { type: DataTypes.UUID, allowNull: false },
    empresaId: { type: DataTypes.UUID, allowNull: true },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    apellido: { type: DataTypes.STRING(100), allowNull: false },
    // Lo que la persona escribió en el formulario; empresaId la vincula con la empresa cargada
    organizacion: { type: DataTypes.STRING(200), allowNull: false },
    cargo: { type: DataTypes.STRING(120), allowNull: false },
    dni: { type: DataTypes.STRING(15), allowNull: true },
    fechaNacimiento: { type: DataTypes.DATEONLY, allowNull: true },
    telefono: { type: DataTypes.STRING(40), allowNull: false },
    email: { type: DataTypes.STRING(200), allowNull: false, validate: { isEmail: true } },
    esSocio: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    comoSeEntero: { type: DataTypes.ENUM(...CANALES), allowNull: true },
    comprobantePagoUrl: { type: DataTypes.STRING(500), allowNull: true },
    estadoPago: { type: DataTypes.ENUM(...ESTADOS_PAGO), allowNull: false, defaultValue: 'no_corresponde' },
    asistio: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Token del link personal que recibe por mail para ver su inscripción, material y certificado
    tokenAcceso: { type: DataTypes.STRING(64), allowNull: false, unique: true },
    // Código que se imprime en el certificado para validarlo
    codigoCertificado: { type: DataTypes.STRING(20), allowNull: true, unique: true },
  },
  {
    tableName: 'inscripciones',
    // Una persona se inscribe una sola vez por capacitación
    indexes: [{ unique: true, fields: ['capacitacion_id', 'email'] }],
  },
);

export default Inscripcion;
