import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { createEmpresa, deleteEmpresa, getEmpresa, getRubros, updateEmpresa } from '../../api/empresas.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { VALORES_INICIALES_EMPRESA, empresaAFormulario } from '../../utils/empresaForm.js';
import { formatearFechaCorta } from '../../utils/formato.js';
import './CapacitacionForm.css';

// Alta (/admin/empresas/nueva) y edición (/admin/empresas/:id) de una empresa, con su personal inscripto
function EmpresaForm() {
  const { id } = useParams();
  const esNueva = !id;
  const navigate = useNavigate();
  const location = useLocation();
  const recienCreada = Boolean(location.state?.creada);

  const [form, setForm] = useState(VALORES_INICIALES_EMPRESA);
  const [empresa, setEmpresa] = useState(null);
  const [rubros, setRubros] = useState([]);
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    getRubros()
      .then(setRubros)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (esNueva) return;
    getEmpresa(id)
      .then((e) => {
        setEmpresa(e);
        setForm(empresaAFormulario(e));
        if (recienCreada) setAviso('Empresa creada.');
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, [id, esNueva, recienCreada]);

  const cambiar = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
    setAviso('');
  };

  const guardar = async (event) => {
    event.preventDefault();
    setError('');
    setAviso('');
    setGuardando(true);
    try {
      if (esNueva) {
        const creada = await createEmpresa(form);
        navigate(`/admin/empresas/${creada.id}`, { replace: true, state: { creada: true } });
      } else {
        const actualizada = await updateEmpresa(id, form);
        setEmpresa((actual) => ({ ...actual, ...actualizada }));
        setForm(empresaAFormulario(actualizada));
        setAviso('Cambios guardados.');
      }
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar. Revisá los datos.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    const cantidad = empresa.inscripciones.length;
    const detalle =
      cantidad === 1
        ? ' Su inscripción se conserva, pero deja de estar vinculada a la empresa.'
        : cantidad > 1
          ? ` Sus ${cantidad} inscripciones se conservan, pero dejan de estar vinculadas a la empresa.`
          : '';
    if (!window.confirm(`¿Eliminar "${empresa.nombre}"?${detalle}`)) return;
    try {
      await deleteEmpresa(id);
      navigate('/admin/empresas', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  if (cargando) return <p className="texto-suave">Cargando…</p>;
  if (!esNueva && !empresa) return <p className="mensaje-error">{error}</p>;

  return (
    <section className="cap-form">
      <p>
        <Link to="/admin/empresas">Volver a empresas</Link>
      </p>
      <h1>{esNueva ? 'Nueva empresa' : empresa.nombre}</h1>

      {!esNueva && empresa.pendienteRevision && (
        <p className="mensaje-aviso">
          Esta empresa se creó automáticamente desde una inscripción. Revisá el nombre y si es socia, y después desmarcá
          «Pendiente de revisión».
        </p>
      )}

      <form onSubmit={guardar} noValidate>
        <fieldset className="cap-form__seccion">
          <legend>Datos de la empresa</legend>

          <label className="campo cap-form__ancho">
            <span className="campo__etiqueta">Nombre</span>
            <input name="nombre" value={form.nombre} onChange={cambiar} required maxLength={200} />
          </label>

          <label className="campo">
            <span className="campo__etiqueta">Rubro</span>
            <input name="rubro" value={form.rubro} onChange={cambiar} list="rubros" maxLength={120} />
            <datalist id="rubros">
              {rubros.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
            <span className="campo__ayuda">Elegí uno de la lista o escribí uno nuevo.</span>
          </label>

          <label className="campo">
            <span className="campo__etiqueta">CUIT (opcional)</span>
            <input name="cuit" value={form.cuit} onChange={cambiar} inputMode="numeric" placeholder="30-12345678-9" />
          </label>

          <label className="campo cap-form__ancho">
            <span className="campo__etiqueta">Mail de contacto (opcional)</span>
            <input type="email" name="emailContacto" value={form.emailContacto} onChange={cambiar} />
            <span className="campo__ayuda">
              A este mail se va a enviar el acceso para que la empresa vea a su personal inscripto.
            </span>
          </label>

          <label className="casilla cap-form__ancho">
            <input type="checkbox" name="esSocia" checked={form.esSocia} onChange={cambiar} />
            Es socia del CCIRR
          </label>

          {!esNueva && (
            <label className="casilla cap-form__ancho">
              <input type="checkbox" name="pendienteRevision" checked={form.pendienteRevision} onChange={cambiar} />
              Pendiente de revisión
            </label>
          )}
        </fieldset>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}
        {aviso && (
          <p className="mensaje-ok" role="status">
            {aviso}
          </p>
        )}

        <div className="cap-form__acciones">
          <button type="submit" className="boton" disabled={guardando}>
            {guardando ? 'Guardando…' : esNueva ? 'Crear empresa' : 'Guardar cambios'}
          </button>
          <Link to="/admin/empresas" className="boton boton--secundario">
            Cancelar
          </Link>
          {!esNueva && (
            <button type="button" className="cap-form__eliminar" onClick={eliminar}>
              Eliminar empresa
            </button>
          )}
        </div>
      </form>

      {!esNueva && (
        <section className="cap-form__seccion cap-form__seccion--lista">
          <h2 className="cap-form__titulo-seccion">Personas inscriptas</h2>
          {empresa.inscripciones.length === 0 ? (
            <p className="texto-suave">Todavía no tiene personas inscriptas en capacitaciones.</p>
          ) : (
            <div className="tabla-contenedor">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Persona</th>
                    <th>Cargo</th>
                    <th>Capacitación</th>
                    <th>Inscripción</th>
                  </tr>
                </thead>
                <tbody>
                  {empresa.inscripciones.map((i) => (
                    <tr key={i.id}>
                      <td>
                        {i.nombre} {i.apellido}
                      </td>
                      <td>{i.cargo}</td>
                      <td>
                        <Link to={`/admin/capacitaciones/${i.Capacitacion.id}`}>{i.Capacitacion.nombre}</Link>
                      </td>
                      <td>{formatearFechaCorta(i.createdAt.slice(0, 10))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </section>
  );
}

export default EmpresaForm;
