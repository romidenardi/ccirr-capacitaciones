import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCapacitacionPublica, buscarEmpresaPorCuit, enviarInscripcion } from '../../api/publico.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { cuitValido, soloDigitos } from '../../utils/cuit.js';
import {
  VALORES_INSCRIPCION,
  CANALES,
  MAXIMO_COMPROBANTE,
  TIPOS_COMPROBANTE,
  armarEnvio,
  esSocioEfectivo,
  montoAPagar,
} from '../../utils/inscripcionForm.js';
import { formatearCosto, formatearFecha, formatearHora, formatearModalidad } from '../../utils/formato.js';
import './Inscripcion.css';

// Formulario público de inscripción: /inscripcion/<slug-de-la-capacitacion>
function Inscripcion() {
  const { slug } = useParams();

  const [capacitacion, setCapacitacion] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const [form, setForm] = useState(VALORES_INSCRIPCION);
  const [empresa, setEmpresa] = useState(null); // resultado de buscar el CUIT
  const [buscandoCuit, setBuscandoCuit] = useState(false);
  const [comprobante, setComprobante] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    getCapacitacionPublica(slug)
      .then(setCapacitacion)
      .catch((err) => setErrorCarga(mensajeDeError(err)));
  }, [slug]);

  // Cuando el CUIT es válido, se busca la organización (medio segundo después de terminar de escribir)
  const cuitCompleto = cuitValido(form.cuit);
  useEffect(() => {
    if (!cuitCompleto) return undefined;
    const espera = setTimeout(() => {
      setBuscandoCuit(true);
      buscarEmpresaPorCuit(soloDigitos(form.cuit))
        .then(setEmpresa)
        .catch(() => setEmpresa({ encontrada: false }))
        .finally(() => setBuscandoCuit(false));
    }, 400);
    return () => clearTimeout(espera);
  }, [form.cuit, cuitCompleto]);

  const cambiar = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((actual) => ({ ...actual, [name]: type === 'checkbox' ? checked : value }));
    if (name === 'cuit') setEmpresa(null);
  };

  const elegirArchivo = (event) => {
    const archivo = event.target.files[0] || null;
    setErrorArchivo('');
    if (archivo && !TIPOS_COMPROBANTE.includes(archivo.type)) {
      setErrorArchivo('Tiene que ser un PDF o una imagen (JPG, PNG o WEBP).');
      event.target.value = '';
      return setComprobante(null);
    }
    if (archivo && archivo.size > MAXIMO_COMPROBANTE) {
      setErrorArchivo('El archivo supera los 5 MB. Probá con una foto o un PDF más liviano.');
      event.target.value = '';
      return setComprobante(null);
    }
    setComprobante(archivo);
  };

  const enviar = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);
    try {
      setResultado(await enviarInscripcion(slug, armarEnvio(form, { empresa, comprobante })));
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(mensajeDeError(err, 'No se pudo completar la inscripción. Revisá los datos.'));
    } finally {
      setEnviando(false);
    }
  };

  if (errorCarga) {
    return (
      <section className="inscripcion inscripcion--mensaje">
        <h1>Inscripción</h1>
        <p>{errorCarga}</p>
      </section>
    );
  }
  if (!capacitacion) return <p className="texto-suave">Cargando…</p>;

  if (resultado) return <Confirmacion resultado={resultado} />;

  const socio = esSocioEfectivo(empresa, form.esSocio);
  const monto = socio === null ? null : montoAPagar(capacitacion, socio);
  const bloqueadaPorSocio = capacitacion.exclusivoSocios && socio === false;
  const pideComprobante = Boolean(monto);
  const faltaComprobante = pideComprobante && capacitacion.pagoObligatorio && !comprobante;

  return (
    <div className="inscripcion">
      <Resumen capacitacion={capacitacion} />

      <section className="inscripcion__formulario">
        <h2>Inscripción</h2>

        {capacitacion.cupoCompleto ? (
          <p className="mensaje-aviso">El cupo de esta capacitación está completo.</p>
        ) : (
          <form onSubmit={enviar} noValidate>
            <fieldset className="inscripcion__grupo">
              <legend>Tus datos</legend>
              <Campo etiqueta="Nombre">
                <input name="nombre" value={form.nombre} onChange={cambiar} autoComplete="given-name" required />
              </Campo>
              <Campo etiqueta="Apellido">
                <input name="apellido" value={form.apellido} onChange={cambiar} autoComplete="family-name" required />
              </Campo>
              <Campo etiqueta="Mail">
                <input type="email" name="email" value={form.email} onChange={cambiar} autoComplete="email" required />
              </Campo>
              <Campo etiqueta="Teléfono">
                <input
                  type="tel"
                  name="telefono"
                  value={form.telefono}
                  onChange={cambiar}
                  autoComplete="tel"
                  required
                />
              </Campo>
              <Campo etiqueta="DNI (opcional)">
                <input name="dni" value={form.dni} onChange={cambiar} inputMode="numeric" placeholder="Solo números" />
              </Campo>
              <Campo etiqueta="Fecha de nacimiento (opcional)">
                <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={cambiar} />
              </Campo>
            </fieldset>

            <fieldset className="inscripcion__grupo">
              <legend>Tu organización</legend>
              <Campo
                etiqueta="CUIT de la organización"
                ayuda="Si te inscribís a título personal, poné tu CUIT o CUIL."
                ancho
              >
                <input
                  name="cuit"
                  value={form.cuit}
                  onChange={cambiar}
                  inputMode="numeric"
                  placeholder="30-12345678-9"
                  required
                />
              </Campo>

              {form.cuit && soloDigitos(form.cuit).length >= 11 && !cuitCompleto && (
                <p className="mensaje-error inscripcion__ancho">El CUIT no es válido. Revisá los números.</p>
              )}
              {buscandoCuit && <p className="texto-suave inscripcion__ancho">Buscando…</p>}

              {empresa?.encontrada && (
                <p className="inscripcion__organizacion inscripcion__ancho">
                  <strong>{empresa.nombre}</strong>
                  {empresa.esSocia && <span className="estado estado--publicada">Socia del CCIRR</span>}
                </p>
              )}

              {empresa && !empresa.encontrada && (
                <>
                  <Campo etiqueta="Nombre de la organización" ancho>
                    <input name="organizacion" value={form.organizacion} onChange={cambiar} required />
                  </Campo>
                  <div className="campo inscripcion__ancho" role="radiogroup" aria-labelledby="pregunta-socio">
                    <span className="campo__etiqueta" id="pregunta-socio">
                      ¿Es socia del CCIRR?
                    </span>
                    <div className="inscripcion__opciones">
                      <label className="casilla">
                        <input
                          type="radio"
                          name="esSocio"
                          value="si"
                          checked={form.esSocio === 'si'}
                          onChange={cambiar}
                        />
                        Sí
                      </label>
                      <label className="casilla">
                        <input
                          type="radio"
                          name="esSocio"
                          value="no"
                          checked={form.esSocio === 'no'}
                          onChange={cambiar}
                        />
                        No
                      </label>
                    </div>
                  </div>
                </>
              )}

              <Campo etiqueta="Tu cargo" ancho>
                <input name="cargo" value={form.cargo} onChange={cambiar} autoComplete="organization-title" required />
              </Campo>
            </fieldset>

            {bloqueadaPorSocio ? (
              <p className="mensaje-aviso">
                Esta capacitación es exclusiva para socios del CCIRR. Si querés asociar a tu organización, comunicate
                con el Centro.
              </p>
            ) : (
              <>
                {pideComprobante && (
                  <fieldset className="inscripcion__grupo">
                    <legend>Pago</legend>
                    <p className="inscripcion__monto inscripcion__ancho">
                      Te corresponde pagar <strong>{formatearCosto(monto)}</strong>
                      {socio ? ' (precio para socios).' : '.'}
                    </p>
                    {capacitacion.instruccionesPago && (
                      <pre className="inscripcion__instrucciones inscripcion__ancho">
                        {capacitacion.instruccionesPago}
                      </pre>
                    )}
                    <Campo
                      etiqueta={capacitacion.pagoObligatorio ? 'Comprobante de pago' : 'Comprobante de pago (opcional)'}
                      ayuda={
                        capacitacion.pagoObligatorio
                          ? 'PDF o imagen, hasta 5 MB.'
                          : 'PDF o imagen, hasta 5 MB. Si todavía no pagaste, podés inscribirte igual y enviarlo después.'
                      }
                      ancho
                    >
                      <input type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={elegirArchivo} />
                    </Campo>
                    {errorArchivo && <p className="mensaje-error inscripcion__ancho">{errorArchivo}</p>}
                  </fieldset>
                )}

                <fieldset className="inscripcion__grupo">
                  <legend>Para terminar</legend>
                  <Campo etiqueta="¿Cómo te enteraste de esta capacitación? (opcional)" ancho>
                    <select name="comoSeEntero" value={form.comoSeEntero} onChange={cambiar}>
                      <option value="">Elegí una opción</option>
                      {CANALES.map((c) => (
                        <option key={c.valor} value={c.valor}>
                          {c.texto}
                        </option>
                      ))}
                    </select>
                  </Campo>

                  {/* Campo trampa: invisible para las personas. Si llega completo, es un robot. */}
                  <div className="inscripcion__trampa" aria-hidden="true">
                    <label>
                      Sitio web
                      <input
                        name="sitioWeb"
                        value={form.sitioWeb}
                        onChange={cambiar}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </label>
                  </div>

                  <label className="casilla inscripcion__ancho inscripcion__consentimiento">
                    <input type="checkbox" name="consentimiento" checked={form.consentimiento} onChange={cambiar} />
                    <span>
                      Acepto que el Centro Comercial e Industrial de Rafaela y la Región use mis datos personales para
                      gestionar esta inscripción, enviarme información sobre la capacitación y emitir el certificado.
                      Puedo pedir que se corrijan o eliminen comunicándome con el Centro.
                    </span>
                  </label>
                </fieldset>

                {error && (
                  <p className="mensaje-error" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="boton inscripcion__enviar"
                  disabled={enviando || !form.consentimiento || faltaComprobante || !empresa}
                >
                  {enviando ? 'Enviando…' : 'Inscribirme'}
                </button>
                {!empresa && <p className="campo__ayuda">Completá el CUIT para continuar.</p>}
                {empresa && faltaComprobante && (
                  <p className="campo__ayuda">Adjuntá el comprobante de pago para continuar.</p>
                )}
              </>
            )}
          </form>
        )}
      </section>
    </div>
  );
}

function Campo({ etiqueta, ayuda, ancho, children }) {
  return (
    <label className={`campo${ancho ? ' inscripcion__ancho' : ''}`}>
      <span className="campo__etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="campo__ayuda">{ayuda}</span>}
    </label>
  );
}

// Datos de la capacitación: lo primero que ve la persona
function Resumen({ capacitacion }) {
  const { clases } = capacitacion;
  const costos = [];
  if (capacitacion.exclusivoSocios) {
    costos.push(`Exclusiva para socios: ${formatearCosto(capacitacion.costoSocios)}`);
  } else if (Number(capacitacion.costoSocios || 0) === Number(capacitacion.costoNoSocios || 0)) {
    costos.push(formatearCosto(capacitacion.costoSocios));
  } else {
    costos.push(`Socios: ${formatearCosto(capacitacion.costoSocios)}`);
    costos.push(`No socios: ${formatearCosto(capacitacion.costoNoSocios)}`);
  }

  return (
    <aside className="inscripcion__resumen">
      <h1>{capacitacion.nombre}</h1>

      <h2 className="inscripcion__subtitulo">{clases.length === 1 ? 'Cuándo y dónde' : `${clases.length} clases`}</h2>
      <ol className="inscripcion__clases">
        {clases.map((k, i) => (
          <li key={i}>
            <span className="inscripcion__clase-fecha">{formatearFecha(k.fecha)}</span>
            <span>
              {formatearHora(k.horaInicio)}
              {k.horaFin && ` a ${formatearHora(k.horaFin)}`} · {formatearModalidad(k.modalidad)}
              {k.lugar && ` · ${k.lugar}`}
            </span>
            {k.tema && <span className="texto-suave">{k.tema}</span>}
          </li>
        ))}
      </ol>

      {capacitacion.disertantes && (
        <>
          <h2 className="inscripcion__subtitulo">Disertante/s</h2>
          <p className="inscripcion__texto">{capacitacion.disertantes}</p>
        </>
      )}

      {capacitacion.temario && (
        <>
          <h2 className="inscripcion__subtitulo">Temario</h2>
          <p className="inscripcion__texto">{capacitacion.temario}</p>
        </>
      )}

      <h2 className="inscripcion__subtitulo">Costo</h2>
      {costos.map((c) => (
        <p key={c} className="inscripcion__costo">
          {c}
        </p>
      ))}

      {(capacitacion.entregaCertificado || capacitacion.entregaMaterial) && (
        <p className="texto-suave inscripcion__entregas">
          {[
            capacitacion.entregaMaterial && 'Incluye material',
            capacitacion.entregaCertificado && 'Entrega certificado',
          ]
            .filter(Boolean)
            .join('. ')}
          .
        </p>
      )}
    </aside>
  );
}

function Confirmacion({ resultado }) {
  const { capacitacion, monto, estadoPago, comprobanteRecibido } = resultado;
  let pago = null;
  if (estadoPago === 'pendiente' && comprobanteRecibido) {
    pago = `Recibimos tu comprobante por ${formatearCosto(monto)}. Te avisamos cuando confirmemos el pago.`;
  } else if (estadoPago === 'pendiente') {
    pago = `Tu pago de ${formatearCosto(monto)} está pendiente. Para completar la inscripción, enviá el comprobante.`;
  }

  return (
    <section className="inscripcion inscripcion--mensaje">
      <h1>¡Listo, {resultado.nombre}!</h1>
      <p className="mensaje-ok">
        Quedaste inscripto/a en <strong>{capacitacion.nombre}</strong>.
      </p>
      {pago && <p>{pago}</p>}
      {pago && estadoPago === 'pendiente' && !comprobanteRecibido && capacitacion.instruccionesPago && (
        <pre className="inscripcion__instrucciones">{capacitacion.instruccionesPago}</pre>
      )}
      <p className="texto-suave">
        Registramos tu mail: <strong>{resultado.email}</strong>. Ante cualquier consulta, comunicate con el CCIRR.
      </p>
    </section>
  );
}

export default Inscripcion;
