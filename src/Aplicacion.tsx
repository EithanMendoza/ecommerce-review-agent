import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProveedorAuth } from './contextos/ContextoAuth';
import RutaProtegida from './componentes/envolturas/RutaProtegida';
import PanelPrincipal from './vistas/PanelPrincipal';
import VistaChat from './vistas/VistaChat';
import VistaLogin from './vistas/VistaLogin';
// 🚀 Importamos la nueva vista de registro
import VistaRegistro from './vistas/VistaRegistro'; 
import EnvolturaAdmin from './componentes/envolturas/EnvolturaAdmin';

// 🆕 Guardián para /chat/:sesionId: solo entra al chat si la navegación vino
// de dentro de la app (con state.desdeApp = true, ej. clic en el historial).
// Si entras por recarga, URL directa, o reabriendo el navegador, te manda a Principal.
function RutaChatExistente() {
  const location = useLocation();
  const esNavegacionInterna = (location.state as { desdeApp?: boolean } | null)?.desdeApp === true;

  if (!esNavegacionInterna) {
    return <Navigate to="/" replace />;
  }

  return <VistaChat key="existente" />;
}

export default function Aplicacion() {
  return (
    <ProveedorAuth>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<VistaLogin />} />
        
        {/* 🚀 Agregamos la ruta para el registro */}
        <Route path="/registro" element={<VistaRegistro />} />

        {/* Rutas Privadas */}
        <Route element={<RutaProtegida />}>
          <Route element={<EnvolturaAdmin />}>
            <Route path="/" element={<PanelPrincipal />} />
            
            {/* Ruta para inicializar un chat completamente nuevo */}
            <Route path="/chat" element={<VistaChat key="nuevo" />} />
            
            {/* Ruta dinámica para cargar el historial de una sesión existente */}
            <Route path="/chat/:sesionId" element={<RutaChatExistente />} />
          </Route>
        </Route>
        
        {/* 🚀 Ruta de respaldo: Si escriben una URL que no existe, los manda al login */}
        <Route path="*" element={<VistaLogin />} />
      </Routes>
    </ProveedorAuth>
  );
}