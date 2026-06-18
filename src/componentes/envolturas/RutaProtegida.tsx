import { Navigate, Outlet } from 'react-router-dom';
import { usarAuth } from '../../contextos/ContextoAuth';

export default function RutaProtegida() {
  const { autenticado } = usarAuth();

  // Si no hay sesión, redirige al login. Si la hay, renderiza la ruta hija (Outlet)
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}