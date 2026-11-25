import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Layout.css';

// Estructura común a todas las pantallas: barra superior institucional, contenido y pie
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
            <NavLink to="/admin/capacitaciones">Administración</NavLink>
            <NavLink to="/mi-inscripcion">Mi inscripción</NavLink>
            <NavLink to="/empresas">Empresas</NavLink>
            {usuario && (
              <button type="button" className="layout__salir" onClick={logout} title={`Sesión de ${usuario.nombre}`}>
                Salir
              </button>
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
