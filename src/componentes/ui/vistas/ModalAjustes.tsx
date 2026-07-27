import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiHerramientas } from '../../../servicios/apiHerramientas';
import {
    Settings,
    PlusCircle,
    MessageSquare,
    Trash2,
    X,
    AlertTriangle,
    User,
    ShieldAlert,
    LayoutGrid,
    LogOut,
    Loader2,
    CheckCircle2,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';

interface ModalAjustesProps {
    isOpen: boolean;
    onClose: () => void;
    usuarioId: string;
    usuarioCorreo: string;
    onAbrirAnalisis: () => void;
    onHistorialPurged: () => void;
}

type AccionPeligrosa = 'chat' | 'cache' | null;
type SeccionActiva = 'perfil' | 'modulos' | 'peligro';
type VistaMovil = 'menu' | 'contenido';

// 🆕 Info de cada sección centralizada, así el menú móvil y el sidebar de escritorio
// usan la misma fuente de datos (título, ícono, descripción corta) sin duplicar texto.
const SECCIONES: { id: SeccionActiva; icono: typeof User; titulo: string; subtitulo: string }[] = [
    { id: 'perfil', icono: User, titulo: 'Tu Cuenta y Perfil', subtitulo: 'Correo y código de identificación' },
    { id: 'modulos', icono: LayoutGrid, titulo: 'Extracción de Datos', subtitulo: 'Vincular nuevas fuentes de información' },
    { id: 'peligro', icono: ShieldAlert, titulo: 'Mantenimiento y Borrado', subtitulo: 'Limpiar historial o datos del sistema' },
];

export default function ModalAjustes({
    isOpen,
    onClose,
    usuarioId,
    usuarioCorreo,
    onAbrirAnalisis,
    onHistorialPurged
}: ModalAjustesProps) {

    const [seccion, setSeccion] = useState<SeccionActiva>('perfil');

    // 🆕 Controla qué "pantalla" se ve en móvil: la lista de opciones o el detalle de una.
    const [vistaMovil, setVistaMovil] = useState<VistaMovil>('menu');

    const [ejecutandoAccion, setEjecutandoAccion] = useState<string | null>(null);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);

    const [notificacion, setNotificacion] = useState<{
        abierta: boolean;
        tipo: 'exito' | 'error' | 'info';
        titulo: string;
        descripcion: string;
    }>({
        abierta: false,
        tipo: 'info',
        titulo: '',
        descripcion: ''
    });

    const [confirmacion, setConfirmacion] = useState<{
        abierta: boolean;
        accion: AccionPeligrosa;
        titulo: string;
        descripcion: string;
    }>({
        abierta: false,
        accion: null,
        titulo: '',
        descripcion: ''
    });

    // 🆕 Cada vez que el modal se abre, resetea la vista móvil a "menu" para que
    // siempre empiece mostrando las opciones, no el detalle de la última sección vista.
    useEffect(() => {
        if (isOpen) {
            setVistaMovil('menu');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const ejecutarAccion = async () => {
        if (!confirmacion.accion) return;

        try {
            setEjecutandoAccion(confirmacion.accion);

            if (confirmacion.accion === 'chat') {
                const res = await apiHerramientas.purgarHistorialPerfil(usuarioId);
                setNotificacion({
                    abierta: true,
                    tipo: 'exito',
                    titulo: '¡Historial Eliminado con Éxito!',
                    descripcion: res.message || 'Todas tus conversaciones han sido borradas de manera permanente de nuestros servidores.'
                });
                // ⚠️ SE ELIMINÓ onHistorialPurged() DE AQUÍ PARA EVITAR EL CIERRE BRUSCO DEL MODAL
            }

            if (confirmacion.accion === 'cache') {
                const res = await apiHerramientas.limpiarCache();
                setNotificacion({
                    abierta: true,
                    tipo: 'exito',
                    titulo: '¡Base de Datos eliminada con Éxito!',
                    descripcion: res.message || 'Los datos se han limpiado correctamente.'
                });
            }
        } catch {
            setNotificacion({
                abierta: true,
                tipo: 'error',
                titulo: 'Hubo un problema',
                descripcion: 'No se pudo completar la acción en este momento. Por favor, inténtalo más tarde.'
            });
        } finally {
            setEjecutandoAccion(null);
            setConfirmacion({ abierta: false, accion: null, titulo: '', descripcion: '' });
        }
    };

    const manejarCerrarSesion = () => {
        setCerrandoSesion(true);
        setTimeout(() => {
            localStorage.removeItem('token_rag');
            window.location.href = '/login';
        }, 1500);
    };

    // 🆕 Al elegir una sección desde el menú móvil, guarda la sección Y navega a la vista de detalle.
    const elegirSeccionMovil = (id: SeccionActiva) => {
        setSeccion(id);
        setVistaMovil('contenido');
    };

    // 🆕 Todo el contenido de las 3 secciones se extrajo a esta función para que tanto
    // el panel de escritorio como la vista de detalle móvil rendericen exactamente lo mismo,
    // sin duplicar el JSX en dos lugares distintos.
    const renderContenidoSeccion = () => (
        <>
            {seccion === 'perfil' && (
                <div className="space-y-6 md:space-y-8 animate-fadeIn">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">Información del Perfil</h3>
                        <p className="text-sm md:text-base text-neutral-400">Aquí encuentras los datos vinculados a tu acceso actual en nuestra plataforma.</p>
                    </div>
                    <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 md:p-6 space-y-4 md:space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">Tu Correo Electrónico</label>
                            <p className="text-sm md:text-base text-neutral-200 font-medium bg-neutral-950 px-4 md:px-5 py-3 md:py-3.5 rounded-xl border border-neutral-800/80 break-all">{usuarioCorreo}</p>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">Código de Identificación Único</label>
                            <p className="text-xs md:text-sm font-mono text-neutral-400 bg-neutral-950 px-4 md:px-5 py-3 md:py-3.5 rounded-xl border border-neutral-800/80 select-all break-all">{usuarioId}</p>
                        </div>
                    </div>
                </div>
            )}

            {seccion === 'modulos' && (
                <div className="space-y-6 md:space-y-8 animate-fadeIn">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2">Extracción y Lectura de Datos</h3>
                        <p className="text-sm md:text-base text-neutral-400">Vincula nuevas fuentes de información para expandir la base de conocimiento de tu sistema.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:gap-5">
                        <div className="border border-neutral-800 bg-neutral-900/20 rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start gap-4 md:gap-6 hover:border-indigo-500/30 transition">
                            <div className="flex gap-3 md:gap-4 items-start">
                                <div className="p-2.5 md:p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl h-fit shrink-0">
                                    <PlusCircle className="text-indigo-400" size={20} />
                                </div>
                                <div className="space-y-1.5">
                                    <h4 className="text-sm md:text-base text-white font-bold">
                                        Cargar Información por URL <span className="text-red-400 text-xs md:text-sm font-bold">(Obligatorio)</span>
                                    </h4>
                                    <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                                        Permite al sistema escanear de forma automatizada una tienda o página web pública para procesar y estructurar las opiniones de los usuarios. <span className="text-indigo-400 font-semibold">Proporcionar el enlace es un requisito estrictamente necesario</span>; sin esta dirección web, el proceso de lectura no podrá iniciarse ni inyectar datos en el chat.
                                    </p>
                                </div>
                            </div>
                            <button
                                // 🆕 Ya NO cerramos Ajustes aquí: el modal de carga se abre por ENCIMA
                                // (tiene mayor z-index), así que al cerrarlo con la X volvemos a ver Ajustes.
                                onClick={() => { onAbrirAnalisis(); }}
                                className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition self-stretch sm:self-end shadow-lg shadow-indigo-600/10"
                            >
                                Iniciar Extracción por URL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {seccion === 'peligro' && (
                <div className="space-y-6 md:space-y-8 animate-fadeIn">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-red-400 mb-2">Mantenimiento de tu Espacio</h3>
                        <p className="text-sm md:text-base text-neutral-400">Herramientas para restablecer o limpiar datos. Recuerda que estas acciones eliminan información de forma definitiva.</p>
                    </div>
                    <div className="space-y-4 md:space-y-5">
                        <div className="border border-neutral-800/80 bg-neutral-900/10 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 hover:border-red-900/30 transition">
                            <div className="flex gap-3 md:gap-4">
                                <MessageSquare className="text-red-400 shrink-0 mt-1" size={20} />
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-bold text-neutral-100">Borrar Historial de Conversaciones</h4>
                                    <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                                        Esto vaciará permanentemente todos los chats y conversaciones que has tenido. El asistente olvidará las pláticas previas para iniciar desde cero de forma limpia.
                                    </p>
                                </div>
                            </div>
                            <button
                                disabled={ejecutandoAccion !== null}
                                onClick={() => setConfirmacion({
                                    abierta: true,
                                    accion: 'chat',
                                    titulo: '¿De verdad deseas borrar tu historial?',
                                    descripcion: 'Esta acción limpiará permanentemente todas tus conversaciones en la nube. No podrás recuperar los mensajes antiguos.'
                                })}
                                className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition shrink-0"
                            >
                                Borrar Chats
                            </button>
                        </div>

                        <div className="border border-neutral-800/80 bg-neutral-900/10 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 hover:border-red-900/30 transition">
                            <div className="flex gap-3 md:gap-4">
                                <Trash2 className="text-red-400 shrink-0 mt-1" size={20} />
                                <div className="space-y-1">
                                    <h4 className="text-sm md:text-base font-bold text-neutral-100">Borrar todos los datos</h4>
                                    <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                                        Borra todos los datos del sistema. Es de gran utilidad si notas datos desactualizados o quieres refrescar el rendimiento del asistente.
                                    </p>
                                </div>
                            </div>
                            <button
                                disabled={ejecutandoAccion !== null}
                                onClick={() => setConfirmacion({
                                    abierta: true,
                                    accion: 'cache',
                                    titulo: '¿Deseas borrar todos los datos del sistema?',
                                    descripcion: 'Se eliminarán los archivos y configuraciones temporales de optimización rápida. Tus datos importantes no se verán alterados.'
                                })}
                                className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition shrink-0"
                            >
                                Borrar Datos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    // 🆕 createPortal saca todo este JSX del <aside> (que tiene "transform" por la
    // animación del menú móvil) y lo monta directo en document.body. Así el "fixed"
    // vuelve a posicionarse respecto a toda la ventana, no respecto al sidebar.
    return createPortal(
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fadeIn p-0 sm:p-6">
                <div className="w-full h-full sm:h-[600px] sm:max-w-5xl rounded-none sm:rounded-3xl overflow-hidden bg-[#141414] border-0 sm:border sm:border-neutral-800 shadow-2xl flex flex-col">

                    {/* CABECERA — solo se muestra en escritorio; en móvil cada "pantalla" tiene su propio header */}
                    <div className="hidden md:flex px-8 py-5 border-b border-neutral-800 justify-between items-center bg-[#161616] shrink-0">
                        <div className="flex items-center gap-3">
                            <Settings size={22} className="text-indigo-400" />
                            <h2 className="text-base uppercase tracking-[0.2em] text-neutral-200 font-bold">
                                Configuración de tu Cuenta
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-400 hover:text-white">
                            <X size={22} />
                        </button>
                    </div>

                    {/* ============================================================ */}
                    {/* 🖥️  ESCRITORIO — layout original sin ningún cambio, oculto en móvil */}
                    {/* ============================================================ */}
                    <div className="hidden md:flex flex-1 overflow-hidden">

                        {/* MENÚ LATERAL IZQUIERDO */}
                        <div className="w-72 bg-[#161616] p-6 border-r border-neutral-800 flex flex-col justify-between">
                            <div className="space-y-2">
                                {SECCIONES.map(({ id, icono: Icono, titulo }) => (
                                    <button
                                        key={id}
                                        onClick={() => setSeccion(id)}
                                        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition ${seccion === id
                                            ? id === 'peligro'
                                                ? 'bg-red-950/20 text-red-400 border border-red-900/30'
                                                : 'bg-neutral-800 text-white'
                                            : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                                            }`}
                                    >
                                        <Icono size={18} />
                                        {titulo}
                                    </button>
                                ))}
                            </div>

                            <div className="border-t border-neutral-800 pt-5">
                                <button
                                    disabled={cerrandoSesion}
                                    onClick={manejarCerrarSesion}
                                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        {cerrandoSesion ? <Loader2 size={18} className="animate-spin text-red-400" /> : <LogOut size={18} />}
                                        <span>{cerrandoSesion ? 'Saliendo de la cuenta...' : 'Cerrar mi sesión'}</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* CONTENIDO DERECHO */}
                        <div className="flex-1 p-10 overflow-y-auto bg-[#121212]">
                            {renderContenidoSeccion()}
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* 📱  MÓVIL — navegación de dos pantallas: menú -> detalle */}
                    {/* ============================================================ */}
                    <div className="flex md:hidden flex-1 flex-col overflow-hidden">

                        {vistaMovil === 'menu' ? (
                            <>
                                {/* Header de la pantalla de menú */}
                                <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-[#161616] shrink-0">
                                    <div className="flex items-center gap-2">
                                        <Settings size={19} className="text-indigo-400" />
                                        <h2 className="text-xs uppercase tracking-[0.15em] text-neutral-200 font-bold">
                                            Configuración
                                        </h2>
                                    </div>
                                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-400 hover:text-white">
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Lista de opciones, tipo "Ajustes" */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#121212]">
                                    {SECCIONES.map(({ id, icono: Icono, titulo, subtitulo }) => (
                                        <button
                                            key={id}
                                            onClick={() => elegirSeccionMovil(id)}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 hover:bg-neutral-900 active:scale-[0.98] transition text-left"
                                        >
                                            <div className={`p-2.5 rounded-xl shrink-0 ${id === 'peligro' ? 'bg-red-500/10 border border-red-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                                                <Icono size={19} className={id === 'peligro' ? 'text-red-400' : 'text-indigo-400'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-neutral-100">{titulo}</p>
                                                <p className="text-xs text-neutral-500 truncate">{subtitulo}</p>
                                            </div>
                                            <ChevronRight size={18} className="text-neutral-600 shrink-0" />
                                        </button>
                                    ))}

                                    {/* Separador visual antes de la opción de salir */}
                                    <div className="pt-3">
                                        <button
                                            disabled={cerrandoSesion}
                                            onClick={manejarCerrarSesion}
                                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 active:scale-[0.98] transition disabled:opacity-50 text-left"
                                        >
                                            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 shrink-0">
                                                {cerrandoSesion ? <Loader2 size={19} className="animate-spin text-red-400" /> : <LogOut size={19} className="text-red-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-red-400">{cerrandoSesion ? 'Saliendo de la cuenta...' : 'Cerrar mi sesión'}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Header de la pantalla de detalle, con botón "atrás" */}
                                <div className="px-3 py-3 border-b border-neutral-800 flex items-center gap-2 bg-[#161616] shrink-0">
                                    <button
                                        onClick={() => setVistaMovil('menu')}
                                        className="p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-300 hover:text-white shrink-0"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <h2 className="text-sm font-bold text-neutral-100 truncate">
                                        {SECCIONES.find((s) => s.id === seccion)?.titulo}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="ml-auto p-2 rounded-xl hover:bg-neutral-800 transition text-neutral-400 hover:text-white shrink-0"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Contenido de la sección elegida */}
                                <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
                                    {renderContenidoSeccion()}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL SECUNDARIO DE CONFIRMACIÓN */}
            {confirmacion.abierta && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center animate-fadeIn p-4">
                    <div className="w-full max-w-md bg-[#161616] border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                            <AlertTriangle size={26} className="text-red-400" />
                        </div>
                        <div className="space-y-2 text-center">
                            <h3 className="text-base font-bold text-white px-2">{confirmacion.titulo}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{confirmacion.descripcion}</p>
                        </div>
                        <div className="pt-2 grid grid-cols-2 gap-3 sm:gap-4">
                            <button onClick={() => setConfirmacion({ abierta: false, accion: null, titulo: '', descripcion: '' })} className="h-11 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 text-sm font-semibold hover:bg-neutral-800 transition">Cancelar</button>
                            <button onClick={ejecutarAccion} disabled={ejecutandoAccion !== null} className="h-11 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition flex items-center justify-center gap-2">
                                {ejecutandoAccion ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL SECUNDARIO DE NOTIFICACIÓN EXITOSA */}
            {notificacion.abierta && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[70] flex items-center justify-center animate-fadeIn p-4">
                    <div className="w-full max-w-md bg-[#161616] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle2 size={28} className="text-emerald-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-bold text-white">{notificacion.titulo}</h3>
                            <p className="text-sm text-neutral-400 leading-relaxed">{notificacion.descripcion}</p>
                        </div>
                        <div className="pt-2">
                            <button onClick={() => setNotificacion({ abierta: false, tipo: 'info', titulo: '', descripcion: '' })} className="w-full h-11 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-semibold border border-neutral-700/60 transition">Entendido y Continuar</button>
                        </div>
                    </div>
                </div>
            )}
        </>,
        document.body
    );
}