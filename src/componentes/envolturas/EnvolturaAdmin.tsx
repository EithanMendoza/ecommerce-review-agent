import { useState, useEffect } from 'react';
import ModalCargarProducto from '../ui/ModalCargarProducto';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Menu, X, PlusCircle, MessageSquare, Trash2, Settings, Info } from 'lucide-react';
import { apiLocal } from '../../servicios/apiLocal';
import type { SesionChat } from '../../tipos/contratos';
import { usarHerramientas } from '../../hooks/usarHerramientas';
import ModalHerramientas from '../ui/ModalHerramientas';
import ModalAjustes from '../ui/vistas/ModalAjustes';
import { apiAuth } from '../../servicios/apiAuth'; // Usamos tu apiAuth original
import DangerConfirmModal from '../../componentes/chat/DangerConfirmModal';
import { apiHerramientas } from '../../servicios/apiHerramientas';

export default function EnvolturaAdmin() {
  const ubicacion = useLocation();
  const navigate = useNavigate();

  const [sesiones, setSesiones] = useState<SesionChat[]>([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(true);

  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalAjustes, setMostrarModalAjustes] = useState(false);

  // 🆕 Estado para controlar la visibilidad del sidebar en móvil
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const { diagnostico, datosModal, cerrarModal, cargandoTool } = usarHerramientas();

  // Estado de usuario dinámico que se llenará con el token real
  const [usuario, setUsuario] = useState({ id: '', nombre: 'Usuario', apellido: '', correo: '' });

  const [chatAEliminar, setChatAEliminar] = useState<string | null>(null);
  const [eliminandoChat, setEliminandoChat] = useState(false);



  // Función para decodificar el JWT de forma nativa sin librerías externas
  const decodificarTokenNativo = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error al decodificar el token:", e);
      return null;
    }
  };

  const onProductoCargado = (sesionId: string) => {
    cargarHistorial();          // refresca el historial del sidebar
    setMostrarModalAjustes(false); // 👈 cierra Ajustes si estaba abierto detrás
    navigate(`/chat/${sesionId}`); // 👈 te manda directo al chat de esa sesión
  };

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
    const token = apiAuth.obtenerToken();
    if (token) {
      const payload = decodificarTokenNativo(token);
      console.log("Contenido del token decodificado:", payload);

      if (payload) {
        // 🚨 Leemos el campo 'username' que viene del backend
        const correoDetectado = payload.username || "";

        // 🆕 nombre/apellido ahora sí vienen en el token (antes solo estaba 'sub').
        // Si por algún motivo faltan (ej. tokens viejos emitidos antes de este cambio),
        // hacemos fallback al correo como antes.
        const nombreDetectado = payload.nombre || "";
        const apellidoDetectado = payload.apellido || "";
        const nombreCompleto = `${nombreDetectado} ${apellidoDetectado}`.trim();

        setUsuario({
          // El ID sigue siendo el UUID (sub) para que la base de datos no falle al purgar
          id: payload.sub || '',

          // Guardamos el correo completo
          correo: correoDetectado,

          nombre: nombreCompleto || (correoDetectado ? correoDetectado.split('@')[0] : 'Usuario'),
          apellido: apellidoDetectado
        });
      }
    }
    cargarHistorial();
  }, [ubicacion.pathname]);

  // 🆕 Cierra el menú móvil automáticamente al navegar a otra ruta
  useEffect(() => {
    setMenuMovilAbierto(false);
  }, [ubicacion.pathname]);

  const manejarEliminacion = (e: React.MouseEvent, sesionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    setChatAEliminar(sesionId);
  };

  const confirmarEliminacionChat = async () => {
    if (!chatAEliminar) return;

    try {
      setEliminandoChat(true);

      await apiLocal.eliminarSesion(chatAEliminar);

      setSesiones((previas) =>
        previas.filter((s) => s.id !== chatAEliminar)
      );

      if (ubicacion.pathname === `/chat/${chatAEliminar}`) {
        navigate('/chat');
      }

      setChatAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Hubo un problema al intentar borrar el chat.');
    } finally {
      setEliminandoChat(false);
    }
  };

  const manejarNuevoChat = async () => {
    try {
      const respuesta = await apiHerramientas.obtenerUltimoAsin();

      if (respuesta && respuesta.asin) {
        // Navegamos al chat limpio. Tu hook se encargará de asociarlo al último producto.
        navigate('/chat');
      }
    } catch (error) {
      navigate('/chat');
    }
  };

  return (
    <div className="flex h-screen bg-[#121212] text-slate-100 select-none">

      {/* 🆕 OVERLAY para cerrar el menú al tocar fuera (solo visible en móvil cuando está abierto) */}
      {menuMovilAbierto && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMenuMovilAbierto(false)}
        />
      )}

      {/* 💻 SIDEBAR IZQUIERDO */}
      {/*
        🆕 Antes: "hidden md:flex" ocultaba el sidebar por completo en móvil sin forma de mostrarlo.
        Ahora: en móvil se posiciona fixed y se desliza dentro/fuera de la pantalla según el estado.
        En escritorio (md:) se comporta igual que antes, siempre visible y estático.
      */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#121212] border-r border-neutral-900 flex flex-col z-50
        transform transition-transform duration-300 ease-in-out
        ${menuMovilAbierto ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Header del Sidebar */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-900 shrink-0">
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            Sistema RAG
          </span>

          {/* 🆕 Botón para cerrar el menú, visible solo en móvil */}
          <button
            onClick={() => setMenuMovilAbierto(false)}
            className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Enlaces Principales */}
        <nav className="px-4 py-4 space-y-1 shrink-0">
          {/* 1. Panel Principal sigue siendo un Link normal */}
          <Link
            to="/"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm ${ubicacion.pathname === '/'
              ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-medium shadow-sm shadow-indigo-950/20'
              : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200'
              }`}
          >
            <LayoutDashboard size={18} className={ubicacion.pathname === '/' ? 'text-indigo-400' : 'text-neutral-400'} />
            Panel Principal
          </Link>

          {/* 2. Nuevo Chat ahora es un Botón inteligente */}
          <button
            onClick={manejarNuevoChat}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm text-neutral-400 hover:bg-neutral-800/60 hover:text-neutral-200"
          >
            <PlusCircle size={18} className="text-neutral-400" />
            Nuevo Chat
          </button>
        </nav>

        {/* Historial de Chats Desplazables */}
        <div className="flex-1 overflow-y-auto px-4 py-2 border-t border-neutral-900/60 ocultar-scroll">
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
        <div className="p-4 border-t border-neutral-900 shrink-0 bg-[#121212]">
          <button
            onClick={() => setMostrarModalAjustes(true)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/50 hover:bg-neutral-800 border border-neutral-800/40 text-neutral-300 hover:text-neutral-100 transition-all group"
          >
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="font-medium text-xs text-neutral-300">{usuario.nombre}</span>
                <span className="text-[10px] text-neutral-500">Configuración del perfil</span>
              </div>
            </div>

            <Settings size={16} className="text-neutral-500 group-hover:rotate-45 transition-transform duration-300" />
          </button>
        </div>


        {/* Modal de Ajustes Centralizado */}
        <ModalAjustes
          isOpen={mostrarModalAjustes}
          onClose={() => setMostrarModalAjustes(false)}
          usuarioId={usuario.id}
          usuarioCorreo={usuario.correo}
          onAbrirAnalisis={() => setMostrarModalProducto(true)}
          onHistorialPurged={() => {
            setSesiones([]); // Vacía la lista en el Sidebar reactivamente
            setMostrarModalAjustes(false);
            navigate('/chat');
          }}
        />
      </aside>

      {/* 🚀 PANEL CENTRAL / CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Superior del Chat */}
        <header className="h-16 bg-[#121212] border-b border-neutral-900 flex items-center px-6 justify-between shrink-0">
          {/* 🆕 Ahora el botón realmente abre el menú móvil */}
          <button
            onClick={() => setMenuMovilAbierto(true)}
            className="md:hidden text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm font-medium text-neutral-500">Motor: <span className="text-neutral-300">Ollama</span></span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#1a1a1a] border border-neutral-800 px-3 py-1.5 rounded-full shadow-inner">
                <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">API Local</span>
                <div className="relative flex items-center justify-center w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
              </div>

              <button
                onClick={diagnostico}
                disabled={cargandoTool}
                className="p-1.5 text-neutral-500 hover:text-indigo-400 hover:bg-white/5 rounded-md transition-all border border-transparent hover:border-indigo-500/20"
                title="Ver Diagnóstico del Servidor"
              >
                {cargandoTool ? (
                  <div className="w-4 h-4 border-2 border-neutral-600 border-t-indigo-400 rounded-full animate-spin"></div>
                ) : (
                  <Info size={17} />
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Área de Renderizado (Outlet) */}
        <main className="flex-1 overflow-auto p-6 bg-[#121212]">
          <div className="max-w-6xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>

      <ModalCargarProducto
        estaAbierto={mostrarModalProducto}
        alCerrar={() => setMostrarModalProducto(false)}
        alCompletar={onProductoCargado}
      />


      {datosModal && (
        <ModalHerramientas
          datos={datosModal}
          alCerrar={cerrarModal}
        />
      )}
      <DangerConfirmModal
        open={chatAEliminar !== null}
        loading={eliminandoChat}
        title="Eliminar conversación"
        description="Este chat será eliminado permanentemente y no podrá recuperarse posteriormente."
        onCancel={() => setChatAEliminar(null)}
        onConfirm={confirmarEliminacionChat}
      />

    </div>
  );
}