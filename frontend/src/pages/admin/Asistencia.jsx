import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInscripciones, marcarAsistencia } from '../../api/inscripciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import Pestanas from '../../components/capacitaciones/Pestanas.jsx';
import { formatearFechaCorta } from '../../utils/formato.js';
import './GestionInscriptos.css';

const resumen = (asistidas, total, minimo) => {
  const requeridas = Math.ceil((total * minimo) / 100);
  return { asistidas, totalClases: total, requeridas, cumple: total > 0 && asistidas >= requeridas };
};

// Grilla de asistencia: personas en filas, clases en columnas. Cada tilde se guarda en el momento.
function Asistencia() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getInscripciones(id)
      .then(setDatos)
      .catch((err) => setError(mensajeDeError(err)));
  }, [id]);

  // Cambia la grilla en pantalla al instante y la guarda; si falla, vuelve atrás y avisa
  const aplicar = (cambio) => {
    setDatos((actual) => {
      const { clases, asistenciaMinima } = actual.capacitacion;
      const inscripciones = actual.inscripciones.map((i) => {
        if (cambio.inscripcionId && i.id !== cambio.inscripcionId) return i;
        const otras = i.clasesAsistidas.filter((c) => c !== cambio.claseId);
        const clasesAsistidas = cambio.presente ? [...otras, cambio.claseId] : otras;
        return { ...i, clasesAsistidas, asistencia: resumen(clasesAsistidas.length, clases.length, asistenciaMinima) };
      });
      return { ...actual, inscripciones };
    });
  };

  const marcar = async (cambio) => {
    const anterior = datos;
    setError('');
    aplicar(cambio);
    try {
      await marcarAsistencia(id, cambio);
    } catch (err) {
      setDatos(anterior);
      setError(mensajeDeError(err, 'No se pudo guardar la asistencia. Probá de nuevo.'));
    }
  };

  if (!datos) return error ? <p className="mensaje-error">{error}</p> : <p className="texto-suave">Cargando…</p>;

  const { capacitacion, inscripciones } = datos;
  const { clases } = capacitacion;
  const todosPresentes = (claseId) =>
    inscripciones.length > 0 && inscripciones.every((i) => i.clasesAsistidas.includes(claseId));

  return (
    <section>
      <p>
        <Link to="/admin/capacitaciones">Volver a capacitaciones</Link>
      </p>
      <h1>{capacitacion.nombre}</h1>
      <Pestanas id={id} inscriptos={capacitacion.inscriptos} />

      {capacitacion.entregaCertificado && (
        <p className="texto-suave">
          Para el certificado hace falta el {capacitacion.asistenciaMinima}% de asistencia: al menos{' '}
          {Math.ceil((clases.length * capacitacion.asistenciaMinima) / 100)} de {clases.length}{' '}
          {clases.length === 1 ? 'clase' : 'clases'}.
        </p>
      )}
      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}

      {inscripciones.length === 0 ? (
        <p className="texto-suave">Todavía no hay personas inscriptas.</p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla asistencia">
            <thead>
              <tr>
                <th>Persona</th>
                {clases.map((c, n) => (
                  <th key={c.id}>
                    <span className="asistencia__clase">
                      Clase {n + 1}
                      <span className="asistencia__fecha">{formatearFechaCorta(c.fecha).slice(0, 5)}</span>
                      <button
                        type="button"
                        className="asistencia__todos"
                        onClick={() => marcar({ claseId: c.id, presente: !todosPresentes(c.id), todos: true })}
                      >
                        {todosPresentes(c.id) ? 'Quitar todos' : 'Marcar todos'}
                      </button>
                    </span>
                  </th>
                ))}
                <th>Total</th>
                {capacitacion.entregaCertificado && <th>Certificado</th>}
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link to={`/admin/capacitaciones/${id}/inscriptos/${i.id}`}>
                      {i.apellido}, {i.nombre}
                    </Link>
                    <span className="tabla__secundario">{i.organizacion}</span>
                  </td>
                  {clases.map((c, n) => {
                    const presente = i.clasesAsistidas.includes(c.id);
                    return (
                      <td key={c.id}>
                        <input
                          type="checkbox"
                          checked={presente}
                          onChange={() => marcar({ inscripcionId: i.id, claseId: c.id, presente: !presente })}
                          aria-label={`${i.nombre} ${i.apellido}, clase ${n + 1}`}
                        />
                      </td>
                    );
                  })}
                  <td className="asistencia__total">
                    {i.asistencia.asistidas}/{i.asistencia.totalClases}
                  </td>
                  {capacitacion.entregaCertificado && (
                    <td>
                      {i.asistencia.cumple ? (
                        <span className="estado estado--publicada">Sí</span>
                      ) : (
                        <span className="texto-suave">No</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Asistencia;
