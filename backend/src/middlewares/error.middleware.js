// Último middleware: convierte cualquier error en una respuesta JSON con un mensaje entendible
export const errorMiddleware = (err, req, res, next) => {
  const where = `${req.method} ${req.originalUrl.split('?')[0]}`;

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'Ya existe un registro con esos datos.' });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ message: 'No se puede eliminar porque tiene registros asociados.' });
  }

  if (err.name === 'SequelizeValidationError') {
    const fields = [...new Set((err.errors || []).map((e) => e.path).filter(Boolean))];
    return res.status(400).json({ message: `Revisá estos datos: ${fields.join(', ')}` });
  }

  if (err.name === 'MulterError') {
    const mensajes = {
      LIMIT_FILE_SIZE: 'El archivo supera los 5 MB. Probá con una foto o un PDF más liviano.',
      LIMIT_FILE_COUNT: 'Adjuntá un solo archivo.',
      LIMIT_UNEXPECTED_FILE: 'Adjuntá un solo archivo.',
    };
    return res.status(400).json({ message: mensajes[err.code] || 'No se pudo recibir el archivo.' });
  }

  const status = err.status || 500;
  // Sin el error completo en el log: los de Sequelize traen la consulta con datos personales
  if (status >= 500) console.error(`[error] ${where} ·`, err.name, err.message);

  const isInternal = status >= 500 && process.env.NODE_ENV === 'production';
  res.status(status).json({ message: isInternal ? 'Error interno del servidor.' : err.message });
};
