import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCapacitaciones } from '../../api/capacitaciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { formatearFechaCorta, formatearModalidades, formatearEstado } from '../../utils/formato.js';

// "10/12/2026" o, si dura varios días, "10/12/2026 al 17/12/2026"
const periodo = (c) =>
  c.fechaInicio === c.fechaFin
    ? formatearFechaCorta(c.fechaInicio)
    : `${formatearFechaCorta(c.fechaInicio)} al ${formatearFechaCorta(c.fechaFin)}`;

// Listado de capacitaciones (administración)
function Capacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    getCapacitaciones()
      .then(setCapacitaciones)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <section>
      <div className="encabezado">
        <h1>Capacitaciones</h1>
        <Link to="/admin/capacitaciones/nueva" className="boton">
          Nueva capacitación
        </Link>
      </div>

      {location.state?.passwordCambiada && <p className="mensaje-ok">Tu contraseña se cambió correctamente.</p>}
      {cargando && <p className="texto-suave">Cargando…</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && !error && capacitaciones.length === 0 && (
        <p className="texto-suave">Todavía no hay capacitaciones cargadas. Creá la primera con «Nueva capacitación».</p>
      )}

      {capacitaciones.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Clases</th>
                <th>Modalidad</th>
                <th>Inscriptos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {capacitaciones.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/admin/capacitaciones/${c.id}`}>{c.nombre}</Link>
                  </td>
                  <td>{periodo(c)}</td>
                  <td>{c.cantidadClases}</td>
                  <td>{formatearModalidades(c.modalidades)}</td>
                  <td>
                    {c.inscriptos ?? 0}
                    {c.cupo ? ` / ${c.cupo}` : ''}
                  </td>
                  <td>
                    <span className={`estado estado--${c.estado}`}>{formatearEstado(c.estado)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Capacitaciones;
