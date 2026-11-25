import sequelize from '../config/database.js';
import Capacitacion from './capacitacion.model.js';
import Clase from './clase.model.js';
import Material from './material.model.js';
import Empresa from './empresa.model.js';
import Inscripcion from './inscripcion.model.js';
import Usuario from './usuario.model.js';
import Asistencia from './asistencia.model.js';

// Una capacitación tiene clases, material e inscripciones. Al borrarla se borran sus clases y su material, pero no se puede
// borrar si tiene inscripciones (RESTRICT): primero hay que cancelarla o borrar las inscripciones a mano.
Capacitacion.hasMany(Clase, { as: 'clases', foreignKey: 'capacitacionId', onDelete: 'CASCADE' });
Clase.belongsTo(Capacitacion, { foreignKey: 'capacitacionId' });

Capacitacion.hasMany(Material, { as: 'materiales', foreignKey: 'capacitacionId', onDelete: 'CASCADE' });
Material.belongsTo(Capacitacion, { foreignKey: 'capacitacionId' });

Capacitacion.hasMany(Inscripcion, { as: 'inscripciones', foreignKey: 'capacitacionId', onDelete: 'RESTRICT' });
Inscripcion.belongsTo(Capacitacion, { foreignKey: 'capacitacionId' });

Empresa.hasMany(Inscripcion, { as: 'inscripciones', foreignKey: 'empresaId', onDelete: 'SET NULL' });
Inscripcion.belongsTo(Empresa, { foreignKey: 'empresaId' });

// Asistencia: qué persona inscripta vino a qué clase. Si se borra la inscripción o la clase, se borra su asistencia.
Inscripcion.hasMany(Asistencia, { as: 'asistencias', foreignKey: 'inscripcionId', onDelete: 'CASCADE' });
Asistencia.belongsTo(Inscripcion, { foreignKey: 'inscripcionId' });
Clase.hasMany(Asistencia, { as: 'asistencias', foreignKey: 'claseId', onDelete: 'CASCADE' });
Asistencia.belongsTo(Clase, { foreignKey: 'claseId' });

export { sequelize, Asistencia, Capacitacion, Clase, Material, Empresa, Inscripcion, Usuario };
