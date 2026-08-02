import { Navigate, Outlet } from 'react-router-dom';
import { usarAuth } from '../../contextos/ContextoAuth';

export default function RutaProtegida() {
  const { autenticado, cargandoAuth } = usarAuth();

  // 🔄 CAMBIO: mientras se resuelve la llamada a /api/auth/me (que confirma
  // si la cookie sigue siendo válida), no sabemos aún si hay sesión.
  // Sin esto, redirige a /login en cada recarga aunque la cookie sea válida,
  // porque 'autenticado' arranca en false hasta que la petición responde.
  if (cargandoAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#121212]">
        <div className="w-8 h-8 border-4 border-neutral-800 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Si no hay sesión, redirige al login. Si la hay, renderiza la ruta hija (Outlet)
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}