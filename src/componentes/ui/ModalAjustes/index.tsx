import React, { useState, useEffect } from 'react';
import { Settings, X, ChevronRight, ArrowLeft, LogOut, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ModalBase from '../ModalBase';
import { useAjustes } from '../../../hooks/useAjustes';
import { DEFINICION_SECCIONES, SeccionPerfil, SeccionModulos, SeccionPeligro, type SeccionActiva } from './vistas/Secciones';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    usuarioId: string;
    usuarioCorreo: string;
    usuarioNombre?: string;    // 🆕
    usuarioApellido?: string;  // 🆕
    onAbrirAnalisis: () => void;
    onHistorialPurged: () => void; // 👈 1. Agrega esto
}

export default function ModalAjustes({ isOpen, onClose, usuarioId, usuarioCorreo, usuarioNombre, usuarioApellido, onAbrirAnalisis, onHistorialPurged }: Props) {
    const [seccion, setSeccion] = useState<SeccionActiva>('perfil');
    const [vistaMovil, setVistaMovil] = useState<'menu' | 'contenido'>('menu');

    const {
        ejecutandoAccion, cerrandoSesion, notificacion, confirmacion,
        abrirConfirmacion, cerrarModalesSecundarios, ejecutarAccion, manejarCerrarSesion
    } = useAjustes(usuarioId, onHistorialPurged);

    useEffect(() => {
        if (isOpen) setVistaMovil('menu');
    }, [isOpen]);

    const renderContenidoSeccion = () => {
        switch (seccion) {
            case 'perfil': return <SeccionPerfil correo={usuarioCorreo} id={usuarioId} nombre={usuarioNombre} apellido={usuarioApellido} />;
            case 'modulos': return <SeccionModulos onAbrirAnalisis={onAbrirAnalisis} />;
            case 'peligro': return <SeccionPeligro bloqueado={ejecutandoAccion !== null} onConfirmar={abrirConfirmacion} />;
            default: return null;
        }
    };

    return (
        <ModalBase isOpen={isOpen}>
            {/* CABECERA ESCRITORIO */}
            <div className="hidden md:flex px-8 py-5 border-b border-neutral-800 justify-between items-center bg-[#161616] shrink-0">
                <div className="flex items-center gap-3">
                    <Settings size={22} className="text-indigo-400" />
                    <h2 className="text-base uppercase tracking-[0.2em] text-neutral-200 font-bold">Configuración</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition">
                    <X size={22} />
                </button>
            </div>

            {/* 🖥️ ESCRITORIO */}
            <div className="hidden md:flex flex-1 overflow-hidden">
                <div className="w-72 bg-[#161616] p-6 border-r border-neutral-800 flex flex-col justify-between">
                    <div className="space-y-2">
                        {DEFINICION_SECCIONES.map(({ id, icono: Icono, titulo }) => (
                            <button
                                key={id} onClick={() => setSeccion(id)}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition ${
                                    seccion === id 
                                    ? id === 'peligro' ? 'bg-red-950/20 text-red-400 border border-red-900/30' : 'bg-neutral-800 text-white' 
                                    : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
                                }`}
                            >
                                <Icono size={18} /> {titulo}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-neutral-800 pt-5">
                        <button disabled={cerrandoSesion} onClick={manejarCerrarSesion} className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50">
                            <div className="flex items-center gap-3">
                                {cerrandoSesion ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
                                <span>{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}</span>
                            </div>
                        </button>
                    </div>
                </div>
                <div className="flex-1 p-10 overflow-y-auto bg-[#121212]">
                    {renderContenidoSeccion()}
                </div>
            </div>

            {/* 📱 MÓVIL */}
            <div className="flex md:hidden flex-1 flex-col overflow-hidden">
                {vistaMovil === 'menu' ? (
                    <>
                        <div className="px-5 py-4 border-b border-neutral-800 flex justify-between items-center bg-[#161616]">
                            <h2 className="text-xs uppercase tracking-[0.15em] text-neutral-200 font-bold flex items-center gap-2"><Settings size={19} className="text-indigo-400" /> Configuración</h2>
                            <button onClick={onClose} className="p-2 rounded-xl text-neutral-400"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#121212]">
                            {DEFINICION_SECCIONES.map(({ id, icono: Icono, titulo, subtitulo }) => (
                                <button key={id} onClick={() => { setSeccion(id); setVistaMovil('contenido'); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 text-left">
                                    <div className={`p-2.5 rounded-xl ${id === 'peligro' ? 'bg-red-500/10' : 'bg-indigo-500/10'}`}>
                                        <Icono size={19} className={id === 'peligro' ? 'text-red-400' : 'text-indigo-400'} />
                                    </div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-bold text-neutral-100">{titulo}</p><p className="text-xs text-neutral-500 truncate">{subtitulo}</p></div>
                                    <ChevronRight size={18} className="text-neutral-600" />
                                </button>
                            ))}
                            <div className="pt-3">
                                <button disabled={cerrandoSesion} onClick={manejarCerrarSesion} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-left disabled:opacity-50">
                                    <div className="p-2.5 rounded-xl bg-red-500/10"><LogOut size={19} className="text-red-400" /></div>
                                    <p className="text-sm font-bold text-red-400">{cerrandoSesion ? 'Saliendo...' : 'Cerrar sesión'}</p>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="px-3 py-3 border-b border-neutral-800 flex items-center gap-2 bg-[#161616]">
                            <button onClick={() => setVistaMovil('menu')} className="p-2 text-neutral-300"><ArrowLeft size={20} /></button>
                            <h2 className="text-sm font-bold text-neutral-100 truncate">{DEFINICION_SECCIONES.find(s => s.id === seccion)?.titulo}</h2>
                            <button onClick={onClose} className="ml-auto p-2 text-neutral-400"><X size={20} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-[#121212]">
                            {renderContenidoSeccion()}
                        </div>
                    </>
                )}
            </div>

            {/* MODALES SECUNDARIOS (Notificaciones / Alertas) */}
            {confirmacion.abierta && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-[#161616] border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
                        <AlertTriangle size={36} className="text-red-400 mx-auto" />
                        <h3 className="text-base font-bold text-white">{confirmacion.titulo}</h3>
                        <p className="text-sm text-neutral-400">{confirmacion.descripcion}</p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button onClick={cerrarModalesSecundarios} className="h-11 rounded-xl bg-neutral-900 text-neutral-300 text-sm font-semibold">Cancelar</button>
                            <button onClick={ejecutarAccion} disabled={ejecutandoAccion !== null} className="h-11 rounded-xl bg-red-600 text-white text-sm font-semibold flex items-center justify-center">
                                {ejecutandoAccion ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notificacion.abierta && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-[#161616] border border-neutral-800 rounded-3xl p-6 text-center space-y-4">
                        <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
                        <h3 className="text-base font-bold text-white">{notificacion.titulo}</h3>
                        <p className="text-sm text-neutral-400">{notificacion.descripcion}</p>
                        <button onClick={cerrarModalesSecundarios} className="w-full h-11 mt-2 rounded-xl bg-neutral-800 text-white text-sm font-semibold">Entendido</button>
                    </div>
                </div>
            )}
        </ModalBase>
    );
}