import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, UserCircle, PlusCircle, MessageSquare, Trash2 } from 'lucide-react';
import { apiLocal } from '../../servicios/apiLocal';
import type { SesionChat } from '../../tipos/contratos';

export default function EnvolturaAdmin() {
  const ubicacion = useLocation();
  const navigate = useNavigate();

  const [sesiones, setSesiones] = useState<SesionChat[]>([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(true);

  // 🚀 Función aislada para poder llamarla cuando sea necesario
  const cargarHistorial = async () => {
    try {
      const datos = await apiLocal.listarSesiones();
      setSesiones(datos);
    } catch (error) {
      console.error('Error al cargar el historial:', error);
    } finally {
      setCargandoSesiones(false);
    }
  };

  // ✨ CORRECCIÓN CRÍTICA: Cada vez que la ruta/URL cambie (ubicacion.pathname), 
  // el Sidebar se actualizará de forma nativa trayendo el título dinámico generado por el Backend.
  useEffect(() => {
    cargarHistorial();
  }, [ubicacion.pathname]);

  const manejarEliminacion = async (e: React.MouseEvent, sesionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('¿Estás seguro de que deseas eliminar este chat? Esta acción es irreversible.')) return;

    try {
      await apiLocal.eliminarSesion(sesionId);
      setSesiones((previas) => previas.filter((s) => s.id !== sesionId));

      if (ubicacion.pathname === `/chat/${sesionId}`) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Hubo un problema al intentar borrar el chat.');
    }
  };

  const enlacesPrincipales = [
    { ruta: '/', icono: LayoutDashboard, texto: 'Panel Principal' },
    { ruta: '/chat', icono: PlusCircle, texto: 'Nuevo Chat' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
          <span className="text-xl font-bold text-indigo-600">Sistema RAG</span>
        </div>

        <nav className="px-4 py-4 space-y-1 shrink-0">
          {enlacesPrincipales.map((enlace) => {
            const activo = ubicacion.pathname === enlace.ruta;
            const Icono = enlace.icono;
            return (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${activo
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
                const rutaSesion = `/chat/${sesion.id}`;
                const activo = ubicacion.pathname === rutaSesion;

                return (
                  <Link
                    key={sesion.id}
                    to={rutaSesion}
                    className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-all text-sm ${activo
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={16} className="shrink-0" />
                      <span className="truncate">
                        {sesion.titulo || `Chat ${sesion.id.substring(0, 6)}`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => manejarEliminacion(e, sesion.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all shrink-0"
                      title="Eliminar chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

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

      <div className="flex-1 flex flex-col overflow-hidden">
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

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}