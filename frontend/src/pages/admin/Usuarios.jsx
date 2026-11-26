import { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, restablecerPassword } from '../../api/usuarios.api.js';
import { mensajeDeError } from '../../api/axios.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatearFechaCorta } from '../../utils/formato.js';
import './Usuarios.css';

// Usuarios de administración: alta con contraseña temporal, restablecer y activar/desactivar
function Usuarios() {
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [agregando, setAgregando] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: '', email: '' });
  const [guardando, setGuardando] = useState(false);
  const [credencial, setCredencial] = useState(null); // { nombre, email, passwordTemporal, motivo }
  const [copiado, setCopiado] = useState(false);

  const cargar = () =>
    getUsuarios()
      .then(setUsuarios)
      .catch((err) => setError(mensajeDeError(err)))
      .finally(() => setCargando(false));

  useEffect(() => {
    cargar();
  }, []);

  const mostrarCredencial = ({ usuario, passwordTemporal }, motivo) => {
    setCredencial({ nombre: usuario.nombre, email: usuario.email, passwordTemporal, motivo });
    setCopiado(false);
  };

  const agregar = async (event) => {
    event.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const resultado = await createUsuario(nuevo);
      mostrarCredencial(resultado, 'alta');
      setNuevo({ nombre: '', email: '' });
      setAgregando(false);
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const restablecer = async (u) => {
    if (
      !window.confirm(`¿Generar una contraseña temporal nueva para ${u.nombre}? Se van a cerrar sus sesiones abiertas.`)
    )
      return;
    setError('');
    try {
      mostrarCredencial(await restablecerPassword(u.id), 'restablecer');
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const cambiarActivo = async (u) => {
    const accion = u.activo ? 'Desactivar' : 'Reactivar';
    const detalle = u.activo ? ' Va a perder el acceso en el acto.' : '';
    if (!window.confirm(`¿${accion} a ${u.nombre}?${detalle}`)) return;
    setError('');
    try {
      await updateUsuario(u.id, { activo: !u.activo });
      await cargar();
    } catch (err) {
      setError(mensajeDeError(err));
    }
  };

  const copiar = async () => {
    const texto = `Plataforma de capacitaciones del CCIRR\n${window.location.origin}/login\nMail: ${credencial.email}\nContraseña temporal: ${credencial.passwordTemporal}\n(al ingresar te va a pedir que elijas una propia)`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  return (
    <section>
      <div className="encabezado">
        <h1>Usuarios</h1>
        {!agregando && (
          <button type="button" className="boton" onClick={() => setAgregando(true)}>
            Agregar usuario
          </button>
        )}
      </div>
      <p className="texto-suave">Personas del equipo que pueden ingresar a la administración de la plataforma.</p>

      {credencial && (
        <div className="credencial" role="status">
          <h2>
            {credencial.motivo === 'alta'
              ? `Usuario creado: ${credencial.nombre}`
              : `Contraseña restablecida: ${credencial.nombre}`}
          </h2>
          <p>
            Pasale estos datos por un canal seguro. <strong>La contraseña temporal no se vuelve a mostrar.</strong>
          </p>
          <dl className="credencial__datos">
            <dt>Mail</dt>
            <dd>{credencial.email}</dd>
            <dt>Contraseña temporal</dt>
            <dd>
              <code>{credencial.passwordTemporal}</code>
            </dd>
          </dl>
          <div className="credencial__acciones">
            <button type="button" className="boton boton--chico" onClick={copiar}>
              {copiado ? 'Copiado' : 'Copiar los datos'}
            </button>
            <button type="button" className="clase__accion" onClick={() => setCredencial(null)}>
              Listo, ya los guardé
            </button>
          </div>
        </div>
      )}

      {agregando && (
        <form className="usuarios__alta" onSubmit={agregar} noValidate>
          <label className="campo">
            <span className="campo__etiqueta">Nombre</span>
            <input value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} required />
          </label>
          <label className="campo">
            <span className="campo__etiqueta">Mail</span>
            <input
              type="email"
              value={nuevo.email}
              onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
              required
            />
          </label>
          <div className="usuarios__alta-acciones">
            <button type="submit" className="boton" disabled={guardando}>
              {guardando ? 'Creando…' : 'Crear usuario'}
            </button>
            <button type="button" className="boton boton--secundario" onClick={() => setAgregando(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {error && (
        <p className="mensaje-error" role="alert">
          {error}
        </p>
      )}
      {cargando && <p className="texto-suave">Cargando…</p>}

      {usuarios.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Estado</th>
                <th>Último ingreso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const soyYo = u.id === yo.id;
                return (
                  <tr key={u.id} className={u.activo ? '' : 'usuarios__inactivo'}>
                    <td>
                      {u.nombre}
                      {soyYo && ' (vos)'}
                      <span className="tabla__secundario">{u.email}</span>
                    </td>
                    <td>
                      {!u.activo ? (
                        <span className="estado estado--cancelada">Desactivado</span>
                      ) : u.debeCambiarPassword ? (
                        <span className="estado estado--revisar">Contraseña temporal</span>
                      ) : (
                        <span className="estado estado--publicada">Activo</span>
                      )}
                    </td>
                    <td>{u.ultimoIngreso ? formatearFechaCorta(u.ultimoIngreso.slice(0, 10)) : 'Nunca'}</td>
                    <td>
                      {!soyYo && (
                        <div className="usuarios__acciones">
                          {u.activo && (
                            <button type="button" className="clase__accion" onClick={() => restablecer(u)}>
                              Restablecer contraseña
                            </button>
                          )}
                          <button
                            type="button"
                            className={`clase__accion${u.activo ? ' clase__accion--quitar' : ''}`}
                            onClick={() => cambiarActivo(u)}
                          >
                            {u.activo ? 'Desactivar' : 'Reactivar'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Usuarios;
