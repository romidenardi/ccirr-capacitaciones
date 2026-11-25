import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  createCapacitacion,
  deleteCapacitacion,
  getCapacitacion,
  updateCapacitacion,
} from '../../api/capacitaciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { VALORES_INICIALES, aFormulario, usaLink, usaLugar, linkInscripcion } from '../../utils/capacitacionForm.js';
import './CapacitacionForm.css';

// Alta (/admin/capacitaciones/nueva) y edición (/admin/capacitaciones/:id) de una capacitación
function CapacitacionForm() {
  const { id } = useParams();
  const esNueva = !id;
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(VALORES_INICIALES);
  const [capacitacion, setCapacitacion] = useState(null);
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const recienCreada = Boolean(location.state?.creada);

  useEffect(() => {
    if (esNueva) return;
    getCapacitacion(id)
      .then((c) => {
        setCapacitacion(c);
        setForm(aFormulario(c));
        if (recienCreada) setAviso('Capacitación creada. Ya podés copiar el link de inscripción.');
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, [id, esNueva, recienCreada]);

  // Un solo manejador para todos los campos: usa el "name" del campo y, si es casilla, su tilde
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
        const creada = await createCapacitacion(form);
        navigate(`/admin/capacitaciones/${creada.id}`, { replace: true, state: { creada: true } });
      } else {
        const actualizada = await updateCapacitacion(id, form);
        setCapacitacion(actualizada);
        setForm(aFormulario(actualizada));
        setAviso('Cambios guardados.');
      }
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo guardar. Revisá los datos.'));
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!window.confirm(`¿Eliminar "${capacitacion.nombre}"? Esta acción no se puede deshacer.`)) return;
    setError('');
    try {
      await deleteCapacitacion(id);
      navigate('/admin/capacitaciones', { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const copiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkInscripcion(capacitacion.slug));
      setAviso('Link copiado.');
    } catch {
      setAviso('No se pudo copiar: seleccioná el link y copialo a mano.');
    }
  };

  if (cargando) return <p className="texto-suave">Cargando…</p>;
  if (!esNueva && !capacitacion) return <p className="mensaje-error">{error}</p>;

  return (
    <section className="cap-form">
      <p>
        <Link to="/admin/capacitaciones">Volver a capacitaciones</Link>
      </p>
      <h1>{esNueva ? 'Nueva capacitación' : capacitacion.nombre}</h1>

      {!esNueva && (
        <div className="cap-form__link">
          <span className="campo__etiqueta">Link de inscripción</span>
          <code>{linkInscripcion(capacitacion.slug)}</code>
          <button type="button" className="boton boton--secundario" onClick={copiarLink}>
            Copiar link
          </button>
        </div>
      )}

      <form onSubmit={guardar} noValidate>
        <fieldset className="cap-form__seccion">
          <legend>Datos generales</legend>

          <label className="campo cap-form__ancho">
            <span className="campo__etiqueta">Nombre</span>
            <input name="nombre" value={form.nombre} onChange={cambiar} required maxLength={200} />
          </label>

          <label className="campo">
            <span className="campo__etiqueta">Fecha</span>
            <input type="date" name="fecha" value={form.fecha} onChange={cambiar} required />
          </label>

          <div className="cap-form__par">
            <label className="campo">
              <span className="campo__etiqueta">Desde</span>
              <input type="time" name="horaInicio" value={form.horaInicio} onChange={cambiar} required />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">Hasta (opcional)</span>
              <input type="time" name="horaFin" value={form.horaFin} onChange={cambiar} />
            </label>
          </div>

          <label className="campo">
            <span className="campo__etiqueta">Modalidad</span>
            <select name="modalidad" value={form.modalidad} onChange={cambiar}>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrida">Híbrida</option>
            </select>
          </label>

          <label className="campo">
            <span className="campo__etiqueta">Cupo (opcional)</span>
            <input type="number" name="cupo" min="1" step="1" value={form.cupo} onChange={cambiar} />
            <span className="campo__ayuda">Vacío = sin límite de inscriptos.</span>
          </label>

          {usaLugar(form.modalidad) && (
            <label className="campo cap-form__ancho">
              <span className="campo__etiqueta">Lugar</span>
              <input name="lugar" value={form.lugar} onChange={cambiar} maxLength={200} />
            </label>
          )}

          {usaLink(form.modalidad) && (
            <label className="campo cap-form__ancho">
              <span className="campo__etiqueta">Link de acceso virtual</span>
              <input type="url" name="linkVirtual" value={form.linkVirtual} onChange={cambiar} placeholder="https://" />
              <span className="campo__ayuda">Se envía por mail a las personas inscriptas. Podés cargarlo después.</span>
            </label>
          )}
        </fieldset>

        <fieldset className="cap-form__seccion">
          <legend>Contenido</legend>

          <label className="campo cap-form__ancho">
            <span className="campo__etiqueta">Temario</span>
            <textarea name="temario" rows={5} value={form.temario} onChange={cambiar} />
          </label>

          <label className="campo cap-form__ancho">
            <span className="campo__etiqueta">Disertante/s</span>
            <textarea name="disertantes" rows={2} value={form.disertantes} onChange={cambiar} />
          </label>
        </fieldset>

        <fieldset className="cap-form__seccion">
          <legend>Participación y costos</legend>

          <label className="casilla cap-form__ancho">
            <input type="checkbox" name="exclusivoSocios" checked={form.exclusivoSocios} onChange={cambiar} />
            Exclusiva para socios
          </label>

          <label className="campo">
            <span className="campo__etiqueta">Costo para socios</span>
            <input type="number" name="costoSocios" min="0" step="1" value={form.costoSocios} onChange={cambiar} />
          </label>

          {!form.exclusivoSocios && (
            <label className="campo">
              <span className="campo__etiqueta">Costo para no socios</span>
              <input
                type="number"
                name="costoNoSocios"
                min="0"
                step="1"
                value={form.costoNoSocios}
                onChange={cambiar}
              />
            </label>
          )}

          <p className="campo__ayuda cap-form__ancho">Dejá el costo vacío si es sin costo. Los montos son en pesos.</p>
        </fieldset>

        <fieldset className="cap-form__seccion">
          <legend>Entregas</legend>
          <label className="casilla cap-form__ancho">
            <input type="checkbox" name="entregaMaterial" checked={form.entregaMaterial} onChange={cambiar} />
            Entrega material
          </label>
          <label className="casilla cap-form__ancho">
            <input type="checkbox" name="entregaCertificado" checked={form.entregaCertificado} onChange={cambiar} />
            Entrega certificado
          </label>
        </fieldset>

        <fieldset className="cap-form__seccion">
          <legend>Estado</legend>
          <label className="campo">
            <span className="campo__etiqueta">Estado</span>
            <select name="estado" value={form.estado} onChange={cambiar}>
              <option value="borrador">Borrador</option>
              <option value="publicada">Publicada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <span className="campo__ayuda">Solo las publicadas van a aceptar inscripciones.</span>
          </label>
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
            {guardando ? 'Guardando…' : esNueva ? 'Crear capacitación' : 'Guardar cambios'}
          </button>
          <Link to="/admin/capacitaciones" className="boton boton--secundario">
            Cancelar
          </Link>
          {!esNueva && (
            <button type="button" className="cap-form__eliminar" onClick={eliminar}>
              Eliminar capacitación
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default CapacitacionForm;
