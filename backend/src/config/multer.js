import multer from 'multer';

// Comprobantes de pago: un solo archivo de hasta 5 MB, en memoria (se revisa su contenido antes de guardarlo)
export const subirComprobante = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 30 },
}).single('comprobante');
