import { useEffect, useState } from 'react';
import { getCapacitaciones } from '../../api/capacitaciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { formatearFecha, formatearHora, formatearModalidad, formatearEstado } from '../../utils/formato.js';

// Listado de capacitaciones (administración). El alta y la edición se suman en el próximo paso.
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
      <h1>Capacitaciones</h1>

      {cargando && <p className="texto-suave">Cargando…</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && !error && capacitaciones.length === 0 && (
        <p className="texto-suave">Todavía no hay capacitaciones cargadas.</p>
      )}

      {capacitaciones.length > 0 && (
        <table className="tabla">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha</th>
              <th>Horario</th>
              <th>Modalidad</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {capacitaciones.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{formatearFecha(c.fecha)}</td>
                <td>{formatearHora(c.horaInicio)}</td>
                <td>{formatearModalidad(c.modalidad)}</td>
                <td>{formatearEstado(c.estado)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Capacitaciones;
