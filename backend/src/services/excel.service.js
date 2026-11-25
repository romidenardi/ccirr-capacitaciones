import ExcelJS from 'exceljs';
import { ESTADOS_VISIBLES } from '../utils/inscripcion.js';

const CANALES = {
  mail: 'Mail del CCIRR',
  whatsapp: 'WhatsApp',
  web: 'Sitio web',
  redes: 'Redes sociales',
  colega: 'Me lo comentó alguien',
  otro: 'Otro',
};

const fechaCorta = (iso) => (iso ? iso.split('-').reverse().slice(0, 2).join('/') : '');
const cuitConGuiones = (c) => (c && c.length === 11 ? `${c.slice(0, 2)}-${c.slice(2, 10)}-${c.slice(10)}` : c || '');

// Planilla de inscriptos de una capacitación: datos, pago y asistencia por clase
export const generarExcelInscriptos = async ({ capacitacion, clases, inscripciones }) => {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'CCIRR Capacitaciones';
  const hoja = libro.addWorksheet('Inscriptos', { views: [{ state: 'frozen', ySplit: 1, xSplit: 2 }] });

  const columnas = [
    { header: 'Apellido', key: 'apellido', width: 18 },
    { header: 'Nombre', key: 'nombre', width: 18 },
    { header: 'DNI', key: 'dni', width: 12 },
    { header: 'Mail', key: 'email', width: 28 },
    { header: 'Teléfono', key: 'telefono', width: 16 },
    { header: 'Organización', key: 'organizacion', width: 28 },
    { header: 'CUIT', key: 'cuit', width: 15 },
    { header: 'Cargo', key: 'cargo', width: 20 },
    { header: 'Socio', key: 'socio', width: 8 },
    { header: 'Monto', key: 'monto', width: 12, style: { numFmt: '"$" #,##0' } },
    { header: 'Pago', key: 'pago', width: 22 },
    { header: 'Cómo se enteró', key: 'canal', width: 20 },
    { header: 'Inscripción', key: 'fecha', width: 12, style: { numFmt: 'dd/mm/yyyy' } },
    ...clases.map((c, i) => ({ header: `Clase ${i + 1} (${fechaCorta(c.fecha)})`, key: `clase${i}`, width: 14 })),
    { header: 'Asistencias', key: 'asistencias', width: 12 },
  ];
  if (capacitacion.entregaCertificado) columnas.push({ header: 'Certificado', key: 'certificado', width: 12 });
  hoja.columns = columnas;

  for (const i of inscripciones) {
    const fila = {
      apellido: i.apellido,
      nombre: i.nombre,
      dni: i.dni || '',
      email: i.email,
      telefono: i.telefono,
      organizacion: i.organizacion,
      cuit: cuitConGuiones(i.cuit),
      cargo: i.cargo,
      socio: i.esSocio ? 'Sí' : 'No',
      monto: i.monto ? Number(i.monto) : null,
      pago: ESTADOS_VISIBLES[i.estadoVisible],
      canal: CANALES[i.comoSeEntero] || '',
      fecha: new Date(i.createdAt),
      asistencias: `${i.asistencia.asistidas}/${i.asistencia.totalClases}`,
      certificado: i.asistencia.cumple ? 'Sí' : 'No',
    };
    clases.forEach((c, n) => {
      fila[`clase${n}`] = i.clasesAsistidas.includes(c.id) ? '✓' : '';
    });
    hoja.addRow(fila);
  }

  // Encabezado en verde institucional
  const encabezado = hoja.getRow(1);
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00523F' } };
  encabezado.alignment = { vertical: 'middle', wrapText: true };
  encabezado.height = 30;
  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columnas.length } };

  return libro;
};
