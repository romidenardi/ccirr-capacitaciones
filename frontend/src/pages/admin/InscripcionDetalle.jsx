import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  cambiarPago,
  createInscripcion,
  deleteInscripcion,
  getComprobante,
  getInscripcion,
  subirComprobante,
  updateInscripcion,
} from '../../api/inscripciones.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { abrirEnPestana } from '../../utils/archivosNavegador.js';
import {
  ESTADOS_PAGO,
  VALORES_INSCRIPCION_ADMIN,
  aEnvioEdicion,
  inscripcionAFormulario,
} from '../../utils/inscripciones.js';
import { CANALES } from '../../utils/inscripcionForm.js';
import { formatearCosto, formatearFechaCorta } from '../../utils/formato.js';
import { formatearCuit } from '../../utils/empresaForm.js';
import './CapacitacionForm.css';
import './GestionInscriptos.css';

// Ficha de una inscripción (/admin/capacitaciones/:id/inscriptos/:inscripcionId)
// o alta manual (/admin/capacitaciones/:id/inscriptos/nueva)
function InscripcionDetalle() {
  const { id: capacitacionId, inscripcionId } = useParams();
  const esNueva = !inscripcionId;
  const navigate = useNavigate();
  const volver = `/admin/capacitaciones/${capacitacionId}/inscriptos`;

  const [inscripcion, setInscripcion] = useState(null);
  const [form, setForm] = useState(VALORES_INSCRIPCION_ADMIN);
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [rechazando, setRechazando] = useState(false);
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (esNueva) return;
    getInscripcion(inscripcionId)
      .then((i) => {
        setInscripcion(i);
        setForm(inscripcionAFormulario(i));
      })
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));
  }, [inscripcionId, esNueva]);

  const cambiar = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
    setAviso('');
  };

  // Para las acciones que devuelven la inscripción actualizada
  const ejecutar = async (accion, mensaje) => {
    setError('');
    setAviso('');
    try {
      const actualizada = await accion();
      setInscripcion((actual) => ({ ...actual, ...actualizada }));
      setForm(inscripcionAFormulario(actualizada));
      if (mensaje) setAviso(mensaje);
      return true;
    } catch (err) {
      setError(mensajeDeError(err));
      return false;
    }
  };

  const guardar = async (event) => {
    event.preventDefault();
    setGuardando(true);
    if (esNueva) {
      try {
        const creada = await createInscripcion(capacitacionId, form);
        navigate(`${volver}/${creada.id}`, { replace: true });
      } catch (err) {
        setError(mensajeDeError(err, 'No se pudo guardar. Revisá los datos.'));
      }
    } else {
      await ejecutar(() => updateInscripcion(inscripcionId, aEnvioEdicion(form)), 'Cambios guardados.');
    }
    setGuardando(false);
  };

  const rechazar = async () => {
    const ok = await ejecutar(() => cambiarPago(inscripcionId, 'rechazar', motivo), 'Pago rechazado.');
    if (ok) {
      setRechazando(false);
      setMotivo('');
    }
  };

  const adjuntar = (event) => {
    const archivo = event.target.files[0];
    event.target.value = '';
    if (archivo) ejecutar(() => subirComprobante(inscripcionId, archivo), 'Comprobante adjuntado.');
  };

  const verComprobante = () =>
    abrirEnPestana(() => getComprobante(inscripcionId)).catch((err) => setError(mensajeDeError(err)));

  const eliminar = async () => {
    const nombre = `${inscripcion.nombre} ${inscripcion.apellido}`;
    if (!window.confirm(`¿Dar de baja la inscripción de ${nombre}? Se borran también su comprobante y su asistencia.`))
      return;
    try {
      await deleteInscripcion(inscripcionId);
      navigate(volver, { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  if (cargando) return <p className="texto-suave">Cargando…</p>;
  if (!esNueva && !inscripcion) return <p className="mensaje-error">{error}</p>;

  const estado = inscripcion && ESTADOS_PAGO[inscripcion.estadoVisible];

  return (
    <section className="ficha cap-form">
      <p>
        <Link to={volver}>Volver a inscriptos</Link>
      </p>
      <h1>{esNueva ? 'Agregar inscripción' : `${inscripcion.nombre} ${inscripcion.apellido}`}</h1>
      {!esNueva && (
        <p className="texto-suave">
          {inscripcion.capacitacion.nombre} · Inscripción del {formatearFechaCorta(inscripcion.createdAt.slice(0, 10))}
          {inscripcion.consentimientoAt ? ' · Aceptó el uso de sus datos' : ' · Cargada desde administración'}
        </p>
      )}

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

      {!esNueva && (
        <>
          <div className="ficha__panel">
            <h2>Pago</h2>
            <div className="ficha__fila">
              <span className="ficha__monto">
                {inscripcion.monto ? formatearCosto(inscripcion.monto) : 'Sin costo'}
              </span>
              <span className={`estado ${estado.clase}`}>{estado.texto}</span>
            </div>
            {inscripcion.estadoPago === 'rechazado' && inscripcion.motivoRechazo && (
              <p className="ficha__fila">Motivo del rechazo: {inscripcion.motivoRechazo}</p>
            )}

            {inscripcion.monto && (
              <>
                <div className="ficha__fila ficha__archivo">
                  {inscripcion.tieneComprobante ? (
                    <button type="button" className="boton boton--secundario boton--chico" onClick={verComprobante}>
                      Ver comprobante
                    </button>
                  ) : (
                    <span className="texto-suave">No envió comprobante.</span>
                  )}
                  <label className="boton boton--secundario boton--chico">
                    {inscripcion.tieneComprobante ? 'Reemplazar comprobante' : 'Adjuntar comprobante'}
                    <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={adjuntar} hidden />
                  </label>
                </div>

                <div className="ficha__fila">
                  {inscripcion.estadoPago !== 'confirmado' && (
                    <button
                      type="button"
                      className="boton boton--chico"
                      onClick={() => ejecutar(() => cambiarPago(inscripcionId, 'confirmar'), 'Pago confirmado.')}
                    >
                      Confirmar pago
                    </button>
                  )}
                  {inscripcion.estadoPago !== 'rechazado' && !rechazando && (
                    <button
                      type="button"
                      className="boton boton--peligro boton--chico"
                      onClick={() => setRechazando(true)}
                    >
                      Rechazar pago
                    </button>
                  )}
                  {(inscripcion.estadoPago === 'confirmado' || inscripcion.estadoPago === 'rechazado') && (
                    <button
                      type="button"
                      className="clase__accion"
                      onClick={() =>
                        ejecutar(() => cambiarPago(inscripcionId, 'pendiente'), 'El pago volvió a pendiente.')
                      }
                    >
                      Volver a pendiente
                    </button>
                  )}
                </div>

                {rechazando && (
                  <div className="ficha__rechazo">
                    <label className="campo">
                      <span className="campo__etiqueta">Motivo del rechazo</span>
                      <textarea
                        rows={2}
                        maxLength={500}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Por ejemplo: el monto transferido no coincide"
                      />
                      <span className="campo__ayuda">La persona lo va a ver en el mail de aviso.</span>
                    </label>
                    <div className="ficha__fila">
                      <button type="button" className="boton boton--peligro boton--chico" onClick={rechazar}>
                        Confirmar rechazo
                      </button>
                      <button type="button" className="clase__accion" onClick={() => setRechazando(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="ficha__panel">
            <h2>Asistencia</h2>
            <p className="ficha__fila">
              Asistió a {inscripcion.asistencia.asistidas} de {inscripcion.asistencia.totalClases}{' '}
              {inscripcion.asistencia.totalClases === 1 ? 'clase' : 'clases'}.
              {inscripcion.capacitacion.entregaCertificado &&
                (inscripcion.asistencia.cumple
                  ? ' Alcanza la asistencia para el certificado.'
                  : ` Para el certificado necesita ${inscripcion.asistencia.requeridas}.`)}
            </p>
            <Link to={`/admin/capacitaciones/${capacitacionId}/asistencia`}>Ir a la grilla de asistencia</Link>
          </div>
        </>
      )}

      <form onSubmit={guardar} noValidate>
        <fieldset className="cap-form__seccion">
          <legend>Datos de la persona</legend>
          <label className="campo">
            <span className="campo__etiqueta">Nombre</span>
            <input name="nombre" value={form.nombre} onChange={cambiar} required />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Apellido</span>
            <input name="apellido" value={form.apellido} onChange={cambiar} required />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Mail</span>
            <input type="email" name="email" value={form.email} onChange={cambiar} required />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Teléfono</span>
            <input name="telefono" value={form.telefono} onChange={cambiar} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">DNI</span>
            <input name="dni" value={form.dni} onChange={cambiar} inputMode="numeric" />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Fecha de nacimiento</span>
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={cambiar} />
          </label>
        </fieldset>

        <fieldset className="cap-form__seccion">
          <legend>Organización</legend>
          {esNueva ? (
            <label className="campo">
              <span className="campo__etiqueta">CUIT (opcional)</span>
              <input name="cuit" value={form.cuit} onChange={cambiar} inputMode="numeric" />
              <span className="campo__ayuda">Si está cargada, se vincula a esa empresa.</span>
            </label>
          ) : (
            <div className="campo">
              <span className="campo__etiqueta">CUIT</span>
              <span>{form.cuit ? formatearCuit(form.cuit) : '—'}</span>
              {inscripcion.empresa && (
                <Link to={`/admin/empresas/${inscripcion.empresa.id}`} className="campo__ayuda">
                  Ver empresa: {inscripcion.empresa.nombre}
                  {inscripcion.empresa.pendienteRevision ? ' (a revisar)' : ''}
                </Link>
              )}
            </div>
          )}
          <label className="campo">
            <span className="campo__etiqueta">Organización</span>
            <input name="organizacion" value={form.organizacion} onChange={cambiar} required />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Cargo</span>
            <input name="cargo" value={form.cargo} onChange={cambiar} />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">¿Cómo se enteró?</span>
            <select name="comoSeEntero" value={form.comoSeEntero} onChange={cambiar}>
              <option value="">Sin dato</option>
              {CANALES.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.texto}
                </option>
              ))}
            </select>
          </label>
          <label className="casilla cap-form__ancho">
            <input type="checkbox" name="esSocio" checked={form.esSocio} onChange={cambiar} />
            Es socio/a del CCIRR
          </label>
          {!esNueva && (
            <label className="campo">
              <span className="campo__etiqueta">Monto a pagar</span>
              <input type="number" name="monto" min="0" step="1" value={form.monto} onChange={cambiar} />
              <span className="campo__ayuda">Vacío = sin costo. No cambia solo si cambiás «Es socio».</span>
            </label>
          )}
          {esNueva && (
            <p className="campo__ayuda cap-form__ancho">
              El monto se calcula según sea socio o no. Si la empresa ya está cargada, manda lo que diga su ficha.
            </p>
          )}
        </fieldset>

        <div className="cap-form__acciones">
          <button type="submit" className="boton" disabled={guardando}>
            {guardando ? 'Guardando…' : esNueva ? 'Agregar inscripción' : 'Guardar cambios'}
          </button>
          <Link to={volver} className="boton boton--secundario">
            Cancelar
          </Link>
          {!esNueva && (
            <button type="button" className="cap-form__eliminar" onClick={eliminar}>
              Dar de baja la inscripción
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default InscripcionDetalle;
