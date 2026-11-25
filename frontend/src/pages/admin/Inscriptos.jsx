import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInscripciones, getExcelInscriptos } from '../../api/inscripciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import Pestanas from '../../components/capacitaciones/Pestanas.jsx';
import { ESTADOS_PAGO, FILTROS_PAGO } from '../../utils/inscripciones.js';
import { descargar } from '../../utils/archivosNavegador.js';
import { formatearCosto } from '../../utils/formato.js';
import './Empresas.css';
import './GestionInscriptos.css';

// Listado de personas inscriptas en una capacitación
function Inscriptos() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pago, setPago] = useState('');
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(false);

  useEffect(() => {
    const espera = setTimeout(() => {
      getInscripciones(id, { q: busqueda, pago })
        .then((d) => {
          setDatos(d);
          setError('');
        })
        .catch((err) => setError(mensajeDeError(err)));
    }, 300);
    return () => clearTimeout(espera);
  }, [id, busqueda, pago]);

  const exportar = async () => {
    setDescargando(true);
    try {
      const archivo = await getExcelInscriptos(id);
      descargar(archivo, `inscriptos-${datos.capacitacion.nombre}.xlsx`);
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setDescargando(false);
    }
  };

  if (!datos) return error ? <p className="mensaje-error">{error}</p> : <p className="texto-suave">Cargando…</p>;

  const { capacitacion, inscripciones } = datos;
  const filtrando = busqueda.trim() !== '' || pago !== '';

  return (
    <section>
      <p>
        <Link to="/admin/capacitaciones">Volver a capacitaciones</Link>
      </p>
      <h1>{capacitacion.nombre}</h1>
      <Pestanas id={id} inscriptos={capacitacion.inscriptos} />

      <div className="encabezado">
        <p className="texto-suave gestion__resumen">
          {capacitacion.inscriptos} {capacitacion.inscriptos === 1 ? 'persona inscripta' : 'personas inscriptas'}
          {capacitacion.cupo ? ` de ${capacitacion.cupo} lugares` : ''}
        </p>
        <div className="gestion__acciones">
          <button type="button" className="boton boton--secundario" onClick={exportar} disabled={descargando}>
            {descargando ? 'Generando…' : 'Exportar a Excel'}
          </button>
          <Link to={`/admin/capacitaciones/${id}/inscriptos/nueva`} className="boton">
            Agregar inscripción
          </Link>
        </div>
      </div>

      <div className="filtros">
        <label className="campo filtros__busqueda">
          <span className="campo__etiqueta">Buscar</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, mail, organización o DNI"
          />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Pago</span>
          <select value={pago} onChange={(e) => setPago(e.target.value)}>
            {FILTROS_PAGO.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.texto}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="mensaje-error">{error}</p>}

      {inscripciones.length === 0 ? (
        <p className="texto-suave">
          {filtrando ? 'Ninguna inscripción coincide con la búsqueda.' : 'Todavía no hay personas inscriptas.'}
        </p>
      ) : (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Persona</th>
                <th>Organización</th>
                <th>Teléfono</th>
                <th>Socio</th>
                <th>Monto</th>
                <th>Pago</th>
              </tr>
            </thead>
            <tbody>
              {inscripciones.map((i) => (
                <tr key={i.id}>
                  <td>
                    <Link to={`/admin/capacitaciones/${id}/inscriptos/${i.id}`}>
                      {i.apellido}, {i.nombre}
                    </Link>
                    <span className="tabla__secundario">{i.email}</span>
                  </td>
                  <td>
                    {i.organizacion}
                    {i.empresa?.pendienteRevision && <span className="tabla__secundario">Empresa a revisar</span>}
                  </td>
                  <td>{i.telefono}</td>
                  <td>{i.esSocio ? 'Sí' : 'No'}</td>
                  <td>{i.monto ? formatearCosto(i.monto) : '—'}</td>
                  <td>
                    <span className={`estado ${ESTADOS_PAGO[i.estadoVisible].clase}`}>
                      {ESTADOS_PAGO[i.estadoVisible].texto}
                    </span>
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

export default Inscriptos;
