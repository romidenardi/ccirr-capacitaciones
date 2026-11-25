import { Link } from 'react-router-dom';

function NoEncontrada() {
  return (
    <section>
      <h1>Esta página no existe</h1>
      <p>
        <Link to="/">Volver al inicio</Link>
      </p>
    </section>
  );
}

export default NoEncontrada;
