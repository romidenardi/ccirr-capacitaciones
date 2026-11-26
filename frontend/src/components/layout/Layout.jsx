import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Layout.css';

// Estructura común a todas las pantallas: barra superior institucional, contenido y pie.
// Con sesión de administración, la barra muestra las secciones de gestión; sin sesión, los accesos públicos.
function Layout() {
  const { usuario, logout } = useAuth();

  return (
    <div className="layout">
      <header className="layout__barra">
        <div className="contenedor layout__barra-interior">
          <NavLink to="/" className="layout__marca">
            <span className="layout__marca-sigla">CCIRR</span>
            <span className="layout__marca-seccion">Capacitaciones</span>
          </NavLink>
          <nav className="layout__nav" aria-label="Secciones">
            {usuario ? (
              <>
                <NavLink to="/admin/capacitaciones">Capacitaciones</NavLink>
                <NavLink to="/admin/empresas">Empresas</NavLink>
                <NavLink to="/admin/usuarios">Usuarios</NavLink>
                <NavLink to="/cuenta/contrasena" title={`Sesión de ${usuario.nombre}`}>
                  Mi contraseña
                </NavLink>
                <button type="button" className="layout__salir" onClick={logout}>
                  Salir
                </button>
              </>
            ) : (
              <>
                <NavLink to="/mi-inscripcion">Mi inscripción</NavLink>
                <NavLink to="/acceso-empresas">Acceso empresas</NavLink>
                <NavLink to="/login">Ingresar</NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="layout__contenido contenedor">
        <Outlet />
      </main>

      <footer className="layout__pie">
        <div className="contenedor">Centro Comercial e Industrial de Rafaela y la Región</div>
      </footer>
    </div>
  );
}

export default Layout;
