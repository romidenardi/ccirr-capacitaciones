import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCapacitaciones } from '../../api/capacitaciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { formatearFecha, formatearHora, formatearModalidad, formatearEstado } from '../../utils/formato.js';

// Listado de capacitaciones (administración)
function Capacitaciones() {
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

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
                <th>Horario</th>
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
                  <td>{formatearFecha(c.fecha)}</td>
                  <td>{formatearHora(c.horaInicio)}</td>
                  <td>{formatearModalidad(c.modalidad)}</td>
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
