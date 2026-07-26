import { useState, useEffect } from 'react';
import type { MensajeHistorial } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

export const usarHistorialChat = (sesionId?: string) => {
  const [historial, setHistorial] = useState<MensajeHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  // 🆕 ASIN del producto de esta sesión (lo manda historial.py, lo necesitamos
  // para saber sobre qué producto exportar el CSV desde las Herramientas rápidas)
  const [asinSesion, setAsinSesion] = useState<string | undefined>(undefined);
  const [tituloSesion, setTituloSesion] = useState<string | undefined>(undefined);

  // 🚀 ESTADO DE CONTROL: Permite forzar recargas manuales desde la vista del chat
  const [trigger, setTrigger] = useState<number>(0);

  // Función expuesta para actualizar el historial y la barra lateral de golpe
  const refrescarHistorial = () => {
    setTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // Si no hay sesionId en la URL, significa que es la ruta "/chat" (Chat Nuevo).
    // Limpiamos el estado inmediatamente y no hacemos peticiones.
    if (!sesionId) {
      setHistorial([]);
      setErrorHistorial(null);
      setAsinSesion(undefined);
      setTituloSesion(undefined);
      return;
    }

    // Si hay un sesionId, disparamos la petición a FastAPI
    const recuperarMensajes = async () => {
      setCargandoHistorial(true);
      setErrorHistorial(null);

      try {
        const respuesta = await apiLocal.obtenerHistorialChat(sesionId);
        setHistorial(respuesta.mensajes);
        setAsinSesion(respuesta.asin);
        setTituloSesion(respuesta.titulo);
      } catch (error) {
        console.error('Fallo al recuperar los mensajes:', error);
        setErrorHistorial('No se pudo cargar la conversación anterior. Intenta de nuevo.');
      } finally {
        setCargandoHistorial(false);
      }
    };

    recuperarMensajes();
  }, [sesionId, trigger]); // 🚀 Escucha cambios en la URL (sesionId) y en el disparador manual (trigger)

  // Exportamos las variables junto con la nueva función para TypeScript
  return { historial, cargandoHistorial, errorHistorial, refrescarHistorial, asinSesion, tituloSesion };
};