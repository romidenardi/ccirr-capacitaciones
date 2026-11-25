import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Archivos subidos (comprobantes de pago y, más adelante, material). Se guardan en la carpeta UPLOADS_DIR:
// en la compu, backend/uploads; en Railway, un volumen (disco que no se borra con cada deploy).
// En la base solo se guarda la "clave" del archivo: carpeta/nombre (ej. comprobantes/3f2a….pdf).

export const carpetaUploads = () => path.resolve(process.env.UPLOADS_DIR || 'uploads');

// Tipo real del archivo según sus primeros bytes (no se confía en la extensión ni en lo que diga el navegador)
export const detectarTipo = (buffer) => {
  if (!buffer || buffer.length < 12) return null;
  if (buffer.subarray(0, 5).toString('latin1') === '%PDF-') return { ext: 'pdf', mime: 'application/pdf' };
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { ext: 'jpg', mime: 'image/jpeg' };
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return { ext: 'png', mime: 'image/png' };
  }
  if (buffer.subarray(0, 4).toString('latin1') === 'RIFF' && buffer.subarray(8, 12).toString('latin1') === 'WEBP') {
    return { ext: 'webp', mime: 'image/webp' };
  }
  return null;
};

// La clave nunca puede salir de la carpeta de uploads (evita pedir "../../.env")
export const rutaDeClave = (clave) => {
  const base = carpetaUploads();
  const ruta = path.resolve(base, clave);
  if (!ruta.startsWith(base + path.sep)) throw new Error('Clave de archivo inválida');
  return ruta;
};

export const guardarArchivo = async (buffer, carpeta, ext) => {
  const clave = `${carpeta}/${crypto.randomUUID()}.${ext}`;
  const ruta = rutaDeClave(clave);
  await fs.mkdir(path.dirname(ruta), { recursive: true });
  await fs.writeFile(ruta, buffer);
  return clave;
};

export const borrarArchivo = async (clave) => {
  if (!clave) return;
  await fs.rm(rutaDeClave(clave), { force: true });
};
