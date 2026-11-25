import { NavLink } from 'react-router-dom';
import './Pestanas.css';

// Pestañas de una capacitación: datos, inscriptos y asistencia
function Pestanas({ id, inscriptos }) {
  return (
    <nav className="pestanas" aria-label="Secciones de la capacitación">
      <NavLink to={`/admin/capacitaciones/${id}`} end>
        Datos
      </NavLink>
      <NavLink to={`/admin/capacitaciones/${id}/inscriptos`}>
        Inscriptos{inscriptos !== undefined && <span className="pestanas__cantidad">{inscriptos}</span>}
      </NavLink>
      <NavLink to={`/admin/capacitaciones/${id}/asistencia`}>Asistencia</NavLink>
    </nav>
  );
}

export default Pestanas;
