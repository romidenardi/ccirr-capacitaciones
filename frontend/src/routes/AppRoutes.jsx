import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import Inicio from '../pages/Inicio.jsx';
import Capacitaciones from '../pages/admin/Capacitaciones.jsx';
import Inscripcion from '../pages/publico/Inscripcion.jsx';
import MiInscripcion from '../pages/asistentes/MiInscripcion.jsx';
import Empresas from '../pages/empresas/Empresas.jsx';
import NoEncontrada from '../pages/NoEncontrada.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Inicio />} />
        <Route path="/admin/capacitaciones" element={<Capacitaciones />} />
        <Route path="/inscripcion/:slug" element={<Inscripcion />} />
        <Route path="/mi-inscripcion" element={<MiInscripcion />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
