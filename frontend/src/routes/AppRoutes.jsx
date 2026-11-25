import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout.jsx';
import RutaProtegida from './RutaProtegida.jsx';
import Inicio from '../pages/Inicio.jsx';
import Login from '../pages/Login.jsx';
import Capacitaciones from '../pages/admin/Capacitaciones.jsx';
import CapacitacionForm from '../pages/admin/CapacitacionForm.jsx';
import Inscripcion from '../pages/publico/Inscripcion.jsx';
import MiInscripcion from '../pages/asistentes/MiInscripcion.jsx';
import Empresas from '../pages/empresas/Empresas.jsx';
import NoEncontrada from '../pages/NoEncontrada.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Pantallas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/inscripcion/:slug" element={<Inscripcion />} />
        <Route path="/mi-inscripcion" element={<MiInscripcion />} />
        <Route path="/empresas" element={<Empresas />} />

        {/* Administración: piden sesión iniciada */}
        <Route element={<RutaProtegida />}>
          <Route path="/admin/capacitaciones" element={<Capacitaciones />} />
          <Route path="/admin/capacitaciones/nueva" element={<CapacitacionForm />} />
          <Route path="/admin/capacitaciones/:id" element={<CapacitacionForm />} />
        </Route>

        <Route path="*" element={<NoEncontrada />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
