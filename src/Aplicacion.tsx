import { Routes, Route } from 'react-router-dom';
import { ProveedorAuth } from './contextos/ContextoAuth';
import RutaProtegida from './componentes/envolturas/RutaProtegida';
import PanelPrincipal from './vistas/PanelPrincipal';
import VistaChat from './vistas/VistaChat';
import VistaLogin from './vistas/VistaLogin';
// 🚀 Importamos la nueva vista de registro
import VistaRegistro from './vistas/VistaRegistro'; 
import EnvolturaAdmin from './componentes/envolturas/EnvolturaAdmin';
// 🚀 Importamos el nuevo componente NotFound (Ajusta la ruta según dónde lo guardaste)
import NotFound from './componentes/NotFound'; 

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
            <Route path="/chat/:sesionId" element={<VistaChat key="existente" />} />
          </Route>
        </Route>
        
        {/* 🚀 Ruta de respaldo (404): Renderiza la página de no encontrado en lugar del login */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ProveedorAuth>
  );
}