import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Envuelve las pantallas de administración: sin sesión, manda al login y después vuelve acá
function RutaProtegida() {
  const { usuario, verificando } = useAuth();
  const location = useLocation();

  if (verificando) return <p className="texto-suave">Cargando…</p>;
  if (!usuario) return <Navigate to={`/login?volver=${encodeURIComponent(location.pathname)}`} replace />;
  // Con contraseña temporal, lo único disponible es cambiarla
  if (usuario.debeCambiarPassword && location.pathname !== '/cuenta/contrasena') {
    return <Navigate to="/cuenta/contrasena" replace />;
  }
  return <Outlet />;
}

export default RutaProtegida;
