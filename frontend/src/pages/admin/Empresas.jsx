import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEmpresas } from '../../api/empresas.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { formatearCuit } from '../../utils/empresaForm.js';
import './Empresas.css';

// Listado de empresas (administración), con búsqueda y filtro por socias
function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [socia, setSocia] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Busca medio segundo después de que se deja de escribir (no en cada tecla)
  useEffect(() => {
    const espera = setTimeout(() => {
      getEmpresas({ q: busqueda, socia })
        .then((datos) => {
          setEmpresas(datos);
          setError('');
        })
        .catch((err) => setError(mensajeDeError(err)))
        .finally(() => setCargando(false));
    }, 400);
    return () => clearTimeout(espera);
  }, [busqueda, socia]);

  const filtrando = busqueda.trim() !== '' || socia !== '';

  return (
    <section>
      <div className="encabezado">
        <h1>Empresas</h1>
        <Link to="/admin/empresas/nueva" className="boton">
          Nueva empresa
        </Link>
      </div>

      <div className="filtros">
        <label className="campo filtros__busqueda">
          <span className="campo__etiqueta">Buscar</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, rubro o CUIT"
          />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Mostrar</span>
          <select value={socia} onChange={(e) => setSocia(e.target.value)}>
            <option value="">Todas</option>
            <option value="si">Socias</option>
            <option value="no">No socias</option>
            <option value="revisar">A revisar</option>
          </select>
        </label>
      </div>

      {cargando && <p className="texto-suave">Cargando…</p>}
      {error && <p className="mensaje-error">{error}</p>}

      {!cargando && !error && empresas.length === 0 && (
        <p className="texto-suave">
          {filtrando ? 'Ninguna empresa coincide con la búsqueda.' : 'Todavía no hay empresas cargadas.'}
        </p>
      )}

      {empresas.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rubro</th>
                <th>CUIT</th>
                <th>Socia</th>
                <th>Inscriptos</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link to={`/admin/empresas/${e.id}`}>{e.nombre}</Link>
                  </td>
                  <td>{e.rubro}</td>
                  <td>{formatearCuit(e.cuit)}</td>
                  <td>
                    {e.pendienteRevision ? (
                      <span className="estado estado--revisar">A revisar</span>
                    ) : e.esSocia ? (
                      <span className="estado estado--publicada">Socia</span>
                    ) : (
                      'No'
                    )}
                  </td>
                  <td>{e.inscriptos ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="texto-suave filtros__total">
            {empresas.length} {empresas.length === 1 ? 'empresa' : 'empresas'}
          </p>
        </div>
      )}
    </section>
  );
}

export default Empresas;
