import { useState, useEffect } from 'react';
import type { MensajeHistorial } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

export const usarHistorialChat = (sesionId?: string) => {
  const [historial, setHistorial] = useState<MensajeHistorial[]>([]);
  const [cargandoHistorial, setCargandoHistorial] = useState<boolean>(false);
  const [errorHistorial, setErrorHistorial] = useState<string | null>(null);

  // 🆕 ASIN y Título del producto de esta sesión
  const [asinSesion, setAsinSesion] = useState<string | undefined>(undefined);
  const [tituloSesion, setTituloSesion] = useState<string | undefined>(undefined);

  // 🚀 ESTADO DE CONTROL: Permite forzar recargas manuales desde la vista del chat
  const [trigger, setTrigger] = useState<number>(0);

  // Función expuesta para actualizar el historial y la barra lateral de golpe
  const refrescarHistorial = () => {
    setTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    // 🚀 BLINDAJE CLAVE: Si no hay sesionId o su valor en texto es "undefined"
    // (común al cargar rutas como /chat/undefined), reseteamos estado y NO disparamos peticiones.
    if (!sesionId || sesionId === 'undefined') {
      setHistorial([]);
      setErrorHistorial(null);
      setAsinSesion(undefined);
      setTituloSesion(undefined);
      setCargandoHistorial(false);
      return;
    }

    let cancelado = false;

    // Si hay un sesionId válido, disparamos la petición a FastAPI
    const recuperarMensajes = async () => {
      setCargandoHistorial(true);
      setErrorHistorial(null);

      try {
        const respuesta = await apiLocal.obtenerHistorialChat(sesionId);

        if (!cancelado) {
          setHistorial(respuesta.mensajes || []);
          setAsinSesion(respuesta.asin);
          setTituloSesion(respuesta.titulo);
        }
      } catch (error) {
        if (!cancelado) {
          console.error('Fallo al recuperar los mensajes:', error);
          setErrorHistorial('No se pudo cargar la conversación anterior. Intenta de nuevo.');
        }
      } finally {
        if (!cancelado) {
          setCargandoHistorial(false);
        }
      }
    };

    recuperarMensajes();

    return () => {
      cancelado = true;
    };
  }, [sesionId, trigger]); // Escucha cambios en la URL (sesionId) y en el disparador manual (trigger)

  return {
    historial,
    cargandoHistorial,
    errorHistorial,
    refrescarHistorial,
    asinSesion,
    tituloSesion
  };
};