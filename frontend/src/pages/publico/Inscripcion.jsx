import { useParams } from 'react-router-dom';

// Formulario público de inscripción: /inscripcion/<slug-de-la-capacitacion>
function Inscripcion() {
  const { slug } = useParams();
  return (
    <section>
      <h1>Inscripción</h1>
      <p className="texto-suave">Formulario de inscripción para «{slug}». Lo armamos en un próximo paso.</p>
    </section>
  );
}

export default Inscripcion;
