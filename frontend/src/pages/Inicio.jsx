import { Link } from 'react-router-dom';

function Inicio() {
  return (
    <section>
      <h1>Capacitaciones del CCIRR</h1>
      <p className="texto-suave">
        Desde acá se gestionan las capacitaciones, las inscripciones y la entrega de material y certificados.
      </p>
      <p>
        <Link to="/admin/capacitaciones" className="boton">
          Ver capacitaciones
        </Link>
      </p>
    </section>
  );
}

export default Inicio;
