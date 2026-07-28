import React from 'react';
import { PlusCircle, MessageSquare, Trash2, ShieldAlert, User, LayoutGrid } from 'lucide-react';
import type { AccionPeligrosa } from '../../../../hooks/useAjustes';

export type SeccionActiva = 'perfil' | 'modulos' | 'peligro';

export const DEFINICION_SECCIONES = [
    { id: 'perfil' as SeccionActiva, icono: User, titulo: 'Tu Cuenta y Perfil', subtitulo: 'Correo y código de identificación' },
    { id: 'modulos' as SeccionActiva, icono: LayoutGrid, titulo: 'Extracción de Datos', subtitulo: 'Vincular nuevas fuentes de información' },
    { id: 'peligro' as SeccionActiva, icono: ShieldAlert, titulo: 'Mantenimiento y Borrado', subtitulo: 'Limpiar historial o datos del sistema' },
];

export const SeccionPerfil = ({ correo, id }: { correo: string, id: string }) => (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
        <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Información del Perfil</h3>
            <p className="text-sm md:text-base text-neutral-400">Datos vinculados a tu acceso actual.</p>
        </div>
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-4 md:p-6 space-y-4">
            <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">Tu Correo Electrónico</label>
                <p className="text-sm md:text-base text-neutral-200 font-medium bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-800/80 break-all">{correo}</p>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wider text-neutral-400 font-bold block">Código de Identificación Único</label>
                <p className="text-xs md:text-sm font-mono text-neutral-400 bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-800/80 select-all break-all">{id}</p>
            </div>
        </div>
    </div>
);

export const SeccionModulos = ({ onAbrirAnalisis }: { onAbrirAnalisis: () => void }) => (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
        <div>
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">Extracción y Lectura de Datos</h3>
            <p className="text-sm md:text-base text-neutral-400">Vincula nuevas fuentes de información.</p>
        </div>
        <div className="border border-neutral-800 bg-neutral-900/20 rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start gap-4 hover:border-indigo-500/30 transition">
            <div className="flex gap-3 md:gap-4 items-start">
                <div className="p-2.5 md:p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl h-fit shrink-0">
                    <PlusCircle className="text-indigo-400" size={20} />
                </div>
                <div className="space-y-1.5">
                    <h4 className="text-sm md:text-base text-white font-bold">Cargar Información por URL <span className="text-red-400 text-xs md:text-sm font-bold">(Obligatorio)</span></h4>
                    <p className="text-xs md:text-sm text-neutral-400 leading-relaxed">
                        Proporcionar el enlace es un requisito estrictamente necesario para iniciar el escaneo.
                    </p>
                </div>
            </div>
            <button onClick={onAbrirAnalisis} className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl transition self-stretch sm:self-end">
                Iniciar Extracción por URL
            </button>
        </div>
    </div>
);

export const SeccionPeligro = ({ 
    bloqueado, 
    onConfirmar 
}: { 
    bloqueado: boolean, 
    onConfirmar: (accion: AccionPeligrosa, titulo: string, descripcion: string) => void 
}) => (
    <div className="space-y-6 md:space-y-8 animate-fadeIn">
        <div>
            <h3 className="text-lg md:text-xl font-bold text-red-400 mb-2">Mantenimiento de tu Espacio</h3>
            <p className="text-sm md:text-base text-neutral-400">Acciones destructivas permanentes.</p>
        </div>
        <div className="space-y-4 md:space-y-5">
            <div className="border border-neutral-800/80 bg-neutral-900/10 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-4 hover:border-red-900/30 transition">
                <div className="flex gap-3 md:gap-4">
                    <MessageSquare className="text-red-400 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="text-sm md:text-base font-bold text-neutral-100">Borrar Historial de Conversaciones</h4>
                        <p className="text-xs md:text-sm text-neutral-400 mt-1">El asistente olvidará las pláticas previas.</p>
                    </div>
                </div>
                <button
                    disabled={bloqueado}
                    onClick={() => onConfirmar('chat', '¿Borrar historial?', 'Limpiará permanentemente todas tus conversaciones.')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition shrink-0"
                >
                    Borrar Chats
                </button>
            </div>
            
            <div className="border border-neutral-800/80 bg-neutral-900/10 rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row justify-between gap-4 hover:border-red-900/30 transition">
                <div className="flex gap-3 md:gap-4">
                    <Trash2 className="text-red-400 shrink-0 mt-1" size={20} />
                    <div>
                        <h4 className="text-sm md:text-base font-bold text-neutral-100">Borrar todos los datos</h4>
                        <p className="text-xs md:text-sm text-neutral-400 mt-1">Limpia archivos y configuraciones de caché.</p>
                    </div>
                </div>
                <button
                    disabled={bloqueado}
                    onClick={() => onConfirmar('cache', '¿Borrar caché del sistema?', 'Se eliminarán configuraciones temporales.')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold rounded-xl transition shrink-0"
                >
                    Borrar Datos
                </button>
            </div>
        </div>
    </div>
);