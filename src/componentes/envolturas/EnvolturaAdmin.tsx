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
    <div className="flex h-screen bg-[#121212] text-slate-100 select-none">

      {/* 💻 SIDEBAR IZQUIERDO (DISEÑO MOCKUP PREMIUM DARK) */}
      <aside className="w-64 bg-[#181818] border-r border-neutral-900 flex flex-col hidden md:flex">
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center px-6 border-b border-neutral-900 shrink-0">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            Sistema RAG
          </span>
        </div>

        {/* Enlaces Principales */}
        <nav className="px-4 py-4 space-y-1 shrink-0">
          {enlacesPrincipales.map((enlace) => {
            const activo = ubicacion.pathname === enlace.ruta;
            const Icono = enlace.icono;
            return (
              <Link
                key={enlace.ruta}
                to={enlace.ruta}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${activo
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-medium shadow-sm shadow-indigo-950/20'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
                  }`}
              >
                <Icono size={18} className={activo ? 'text-indigo-400' : 'text-neutral-400'} />
                {enlace.texto}
              </Link>
            );
          })}
        </nav>

        {/* Historial de Chats Desplazables */}
        <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-neutral-900/60">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3 mt-1">
            Historial
          </h3>

          {cargandoSesiones ? (
            <div className="flex justify-center py-4">
              <div className="w-5 h-5 border-2 border-neutral-800 border-t-indigo-400 rounded-full animate-spin"></div>
            </div>
          ) : sesiones.length === 0 ? (
            <p className="px-3 text-xs text-neutral-600 italic">No hay chats previos.</p>
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
                      ? 'bg-[#222222] text-slate-100 border border-neutral-800 font-medium'
                      : 'text-neutral-400 hover:bg-[#1c1c1c] hover:text-neutral-200'
                      }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare size={16} className={`shrink-0 ${activo ? 'text-indigo-400' : 'text-neutral-500'}`} />
                      <span className="truncate">
                        {sesion.titulo || `Chat ${sesion.id.substring(0, 6)}`}
                      </span>
                    </div>

                    <button
                      onClick={(e) => manejarEliminacion(e, sesion.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-red-400 hover:bg-red-950/30 rounded-md transition-all shrink-0"
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

        {/* Perfil / Footer del Sidebar */}
        <div className="p-4 border-t border-neutral-900 shrink-0 bg-[#141414]">
          <div className="flex items-center gap-3 text-sm text-neutral-400">
            <UserCircle size={24} className="text-indigo-400/80" />
            <div className="flex flex-col">
              <span className="font-medium text-neutral-300">Modo Desarrollo</span>
              <button
                onClick={() => {
                  localStorage.removeItem('token_rag');
                  window.location.reload();
                }}
                className="text-xs text-red-400 hover:text-red-300 text-left transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* 🚀 PANEL CENTRAL / CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header Superior del Chat */}
        <header className="h-16 bg-[#181818] border-b border-neutral-900 flex items-center px-6 justify-between shrink-0">
          <button className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors">
            <Menu size={24} />
          </button>

          {/* Estado de conexión del Motor Local Ollama */}
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-400">Motor: Ollama</span>
            <div className="flex items-center gap-2 bg-[#202020] border border-neutral-800 px-2.5 py-1 rounded-full">
              <span className="text-xs text-neutral-400 font-medium">API Local</span>
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            </div>
          </div>
        </header>

        {/* Área de Renderizado de la Vista Interna (Outlet) */}
        <main className="flex-1 overflow-auto p-6 bg-[#121212]">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}