import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Menu, UserCircle, PlusCircle, MessageSquare } from 'lucide-react';
import { apiLocal } from '../../servicios/apiLocal';
import type { SesionChat } from '../../tipos/contratos';

export default function EnvolturaAdmin() {
  const ubicacion = useLocation();
  
  // Estados para manejar el historial
  const [sesiones, setSesiones] = useState<SesionChat[]>([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(true);

  // Efecto para cargar las sesiones al iniciar la aplicación
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const datos = await apiLocal.listarSesiones();
        setSesiones(datos);
      } catch (error) {
        console.error('Error al cargar el historial de chats:', error);
      } finally {
        setCargandoSesiones(false);
      }
    };

    cargarHistorial();
  }, []);

  // Enlaces estáticos principales
  const enlacesPrincipales = [
    { ruta: '/', icono: LayoutDashboard, texto: 'Panel Principal' },
    { ruta: '/chat', icono: PlusCircle, texto: 'Nuevo Chat' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Menú Lateral (Sidebar) estático */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <span className="text-xl font-bold text-indigo-600">Sistema RAG</span>
        </div>
        
        {/* Navegación Principal */}
        <nav className="px-4 py-4 space-y-1 shrink-0">
          {enlacesPrincipales.map((enlace) => {
            const activo = ubicacion.pathname === enlace.ruta;
            const Icono = enlace.icono;
            return (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activo 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icono size={20} />
                {enlace.texto}
              </Link>
            );
          })}
        </nav>

        {/* Sección Dinámica: Historial de Chats */}
        <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-slate-100">
          <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Historial
          </h3>
          
          {cargandoSesiones ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : sesiones.length === 0 ? (
            <p className="px-3 text-sm text-slate-400 italic">No hay chats previos.</p>
          ) : (
            <div className="space-y-1">
              {sesiones.map((sesion) => {
                // Creamos una ruta dinámica para cada sesión
                const rutaSesion = `/chat/${sesion.id}`;
                const activo = ubicacion.pathname === rutaSesion;
                
                return (
                  <Link
                    key={sesion.id}
                    to={rutaSesion}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                      activo 
                        ? 'bg-slate-100 text-slate-900 font-medium' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <MessageSquare size={16} />
                    {/* Fallback por si la base de datos no devuelve un título */}
                    <span className="truncate">
                      {sesion.titulo || `Chat ${sesion.id.substring(0, 6)}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <UserCircle size={24} />
            <div className="flex flex-col">
              <span className="font-medium">Modo Desarrollo</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('token_rag');
                  window.location.reload();
                }}
                className="text-xs text-red-500 hover:text-red-700 text-left"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Área Principal (El resto de la pantalla) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Cabecera Superior (Header) */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
          <button className="md:hidden text-slate-500 hover:text-slate-700">
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-slate-500">Motor: Ollama</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">API Local</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            </div>
          </div>
        </header>

        {/* Contenido Dinámico */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}