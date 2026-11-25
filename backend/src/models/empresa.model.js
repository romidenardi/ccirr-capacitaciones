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
    // Solo los 11 números, sin guiones (se muestran con guiones en pantalla)
    cuit: { type: DataTypes.STRING(11), allowNull: true, unique: true },
    // Para el acceso de empresas: ahí se envía el link para ver a su personal inscripto
    emailContacto: { type: DataTypes.STRING(200), allowNull: true, validate: { isEmail: true } },
    esSocia: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    // Creada automáticamente desde una inscripción: hay que revisar el nombre y si es socia
    pendienteRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'empresas' },
);

export default Empresa;
