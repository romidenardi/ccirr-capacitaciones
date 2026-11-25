import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { mensajeDeError } from '../api/axios.js';
import './Login.css';

// Solo se aceptan rutas internas para volver (evita redirigir a otro sitio)
const destinoSeguro = (volver) => (volver && volver.startsWith('/') && !volver.startsWith('//') ? volver : null);

function Login() {
  const { usuario, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destino = destinoSeguro(params.get('volver')) || '/admin/capacitaciones';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  if (usuario) return <Navigate to={destino} replace />;

  const ingresar = async (event) => {
    event.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await login(email, password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(mensajeDeError(err));
      setEnviando(false);
    }
  };

  return (
    <section className="login">
      <h1>Ingresar</h1>
      <p className="texto-suave">Acceso para el equipo del CCIRR que administra las capacitaciones.</p>

      <form onSubmit={ingresar} className="login__form" noValidate>
        <label className="campo">
          <span className="campo__etiqueta">Mail</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="campo">
          <span className="campo__etiqueta">Contraseña</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="mensaje-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </section>
  );
}

export default Login;
