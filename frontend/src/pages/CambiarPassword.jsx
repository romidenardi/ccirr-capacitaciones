import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { cambiarPassword } from '../api/auth.api.js';
import { mensajeDeError } from '../api/axios.js';
import './Login.css';

const LARGO_MINIMO = 10;

// Cambio de la propia contraseña. Obligatorio si se ingresó con una contraseña temporal.
function CambiarPassword() {
  const { usuario, actualizarSesion } = useAuth();
  const navigate = useNavigate();
  const obligatorio = usuario.debeCambiarPassword;

  const [actual, setActual] = useState('');
  const [nueva, setNueva] = useState('');
  const [repetida, setRepetida] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const guardar = async (event) => {
    event.preventDefault();
    setError('');
    if (nueva.length < LARGO_MINIMO)
      return setError(`La contraseña nueva tiene que tener al menos ${LARGO_MINIMO} caracteres.`);
    if (nueva !== repetida) return setError('Las dos contraseñas nuevas no coinciden.');

    setEnviando(true);
    try {
      const { token, usuario: actualizado } = await cambiarPassword(actual, nueva);
      actualizarSesion(token, actualizado);
      navigate('/admin/capacitaciones', { replace: true, state: { passwordCambiada: true } });
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  };

  return (
    <section className="login">
      <h1>{obligatorio ? 'Elegí tu contraseña' : 'Cambiar mi contraseña'}</h1>
      <p className="texto-suave">
        {obligatorio
          ? 'Ingresaste con una contraseña temporal. Antes de seguir, elegí una propia.'
          : `Al cambiarla, se cierran tus sesiones abiertas en otros dispositivos.`}
      </p>

      <form onSubmit={guardar} className="login__form" noValidate>
        <label className="campo">
          <span className="campo__etiqueta">{obligatorio ? 'Contraseña temporal' : 'Contraseña actual'}</span>
          <input
            type="password"
            autoComplete="current-password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
          />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Contraseña nueva</span>
          <input
            type="password"
            autoComplete="new-password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
          />
          <span className="campo__ayuda">Al menos {LARGO_MINIMO} caracteres.</span>
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Repetí la contraseña nueva</span>
          <input
            type="password"
            autoComplete="new-password"
            value={repetida}
            onChange={(e) => setRepetida(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        <div className="login__acciones">
          <button type="submit" className="boton" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar contraseña'}
          </button>
          {!obligatorio && (
            <Link to="/admin/capacitaciones" className="boton boton--secundario">
              Cancelar
            </Link>
          )}
        </div>
      </form>
    </section>
  );
}

export default CambiarPassword;
