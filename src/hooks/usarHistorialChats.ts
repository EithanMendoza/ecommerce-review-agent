import { useState, useEffect } from 'react';
import type { MensajeHistorial } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

export const usarHistorialChat = (sesionId?: string) => {
  const [historial, setHistorial] = useState<MensajeHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  useEffect(() => {
    // Si no hay sesionId en la URL, significa que es la ruta "/chat" (Chat Nuevo).
    // Limpiamos el estado inmediatamente y no hacemos peticiones.
    if (!sesionId) {
      setHistorial([]);
      setErrorHistorial(null);
      return;
    }

    // Si hay un sesionId, disparamos la petición a FastAPI
    const recuperarMensajes = async () => {
      setCargandoHistorial(true);
      setErrorHistorial(null);
      
      try {
        const mensajesRecuperados = await apiLocal.obtenerHistorialChat(sesionId);
        setHistorial(mensajesRecuperados);
      } catch (error) {
        console.error('Fallo al recuperar los mensajes:', error);
        setErrorHistorial('No se pudo cargar la conversación anterior. Intenta de nuevo.');
      } finally {
        setCargandoHistorial(false);
      }
    };

    recuperarMensajes();
  }, [sesionId]); // El efecto se vuelve a ejecutar si la URL cambia a otra sesión

  return { historial, cargandoHistorial, errorHistorial };
};