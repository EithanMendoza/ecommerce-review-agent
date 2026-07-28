import { useState, useCallback } from 'react';
import { apiHerramientas } from '../servicios/apiHerramientas';

export type AccionPeligrosa = 'chat' | 'cache' | null;

export const useAjustes = (usuarioId: string, onHistorialPurged: () => void) => {
    const [ejecutandoAccion, setEjecutandoAccion] = useState<AccionPeligrosa>(null);
    const [cerrandoSesion, setCerrandoSesion] = useState(false);

    const [notificacion, setNotificacion] = useState({ abierta: false, tipo: 'info', titulo: '', descripcion: '' });
    const [confirmacion, setConfirmacion] = useState({ abierta: false, accion: null as AccionPeligrosa, titulo: '', descripcion: '' });

    const abrirConfirmacion = useCallback((accion: AccionPeligrosa, titulo: string, descripcion: string) => {
        setConfirmacion({ abierta: true, accion, titulo, descripcion });
    }, []);

    const cerrarModalesSecundarios = useCallback(() => {
        setConfirmacion({ abierta: false, accion: null, titulo: '', descripcion: '' });
        setNotificacion({ abierta: false, tipo: 'info', titulo: '', descripcion: '' });
    }, []);

    const ejecutarAccion = async () => {
        if (!confirmacion.accion) return;
        try {
            setEjecutandoAccion(confirmacion.accion);

            if (confirmacion.accion === 'chat') {
                const res = await apiHerramientas.purgarHistorialPerfil(usuarioId);
                setNotificacion({
                    abierta: true, tipo: 'exito',
                    titulo: '¡Historial Eliminado!',
                    descripcion: res.message || 'Todas tus conversaciones han sido borradas permanentemente.'
                });
                onHistorialPurged(); // 👈 2. Llamamos a la función cuando se purga el historial
            }

            if (confirmacion.accion === 'cache') {
                const res = await apiHerramientas.limpiarCache();
                setNotificacion({
                    abierta: true, tipo: 'exito',
                    titulo: '¡Datos eliminados con Éxito!',
                    descripcion: res.message || 'Los datos se han limpiado correctamente.'
                });
            }
        } catch {
            setNotificacion({
                abierta: true, tipo: 'error',
                titulo: 'Hubo un problema',
                descripcion: 'No se pudo completar la acción en este momento.'
            });
        } finally {
            setEjecutandoAccion(null);
            setConfirmacion(prev => ({ ...prev, abierta: false }));
        }
    };

    const manejarCerrarSesion = useCallback(() => {
        setCerrandoSesion(true);
        setTimeout(() => {
            localStorage.removeItem('token_rag');
            window.location.href = '/login';
        }, 1500);
    }, []);

    return {
        ejecutandoAccion, cerrandoSesion, notificacion, confirmacion,
        abrirConfirmacion, cerrarModalesSecundarios, ejecutarAccion, manejarCerrarSesion
    };
};