// src/hooks/useProcesarProducto.ts
import { useState, useRef } from 'react';
import { apiLocal } from '../servicios/apiLocal';

export type EstadoModal = 'formulario' | 'procesando' | 'exito';

export const useProcesarProducto = () => {
  const [estado, setEstado] = useState<EstadoModal>('formulario');
  const [error, setError] = useState<string>('');
  const [mensajeEstado, setMensajeEstado] = useState<string>(''); // 🚀 FEEDBACK DETALLADO PARA LA UI
  const [sesionId, setSesionId] = useState<string | null>(null);

  const operacionActiva = useRef(true);

  const procesarEnlace = async (url: string) => {
    if (!url.trim()) {
      setError('Por favor, ingresa el enlace requerido para continuar.');
      return;
    }

    setEstado('procesando');
    setError('');
    setMensajeEstado('Iniciando solicitud en segundo plano...');
    operacionActiva.current = true;

    try {
      // 1. Solicitamos el inicio del Scraping y la Ficha Técnica
      const respuestaInicial = await apiLocal.cargarNuevoProducto(url);
      const asin = respuestaInicial.asin;

      // VÍA RÁPIDA: Si el producto ya existía en la BD local de este usuario
      if (respuestaInicial.status === "listo") {
        setMensajeEstado(respuestaInicial.mensaje || 'Producto recuperado con éxito.');
      }
      // VÍA LENTA: El scraper entró en la cola de procesamiento en segundo plano
      else if (respuestaInicial.status === "procesando") {
        let estadoActual = "procesando";
        setMensajeEstado(respuestaInicial.mensaje || 'Procesando producto...');

        // 2. Bucle de Sondeo (Polling) dinámico y descriptivo
        while (estadoActual === "procesando") {
          if (!operacionActiva.current) return;

          // Espera estratégica de 3 segundos entre verificaciones
          await new Promise(resolve => setTimeout(resolve, 3000));
          if (!operacionActiva.current) return;

          // Consultamos el estado exacto del robot
          const respuestaEstado = await apiLocal.consultarEstadoScraping(asin);
          estadoActual = respuestaEstado.estado;

          // Inyectamos el mensaje dinámico del backend directamente a la UI
          setMensajeEstado(respuestaEstado.mensaje || 'Analizando comentarios...');

          // Control explícito de fallos del scraper
          if (estadoActual === "error_sin_resenas") {
            throw new Error(respuestaEstado.mensaje || "El producto no cuenta con opiniones públicas suficientes en Amazon.");
          }

          if (estadoActual === "error") {
            throw new Error(respuestaEstado.mensaje || "No se pudo completar la extracción del producto. Intenta más tarde.");
          }
        }
      }

      if (!operacionActiva.current) return;

      // 3. Cuando el backend termina con éxito, creamos la conversación enlazada
      setMensajeEstado('Indexación completada. Inicializando sesión de chat...');
      const sesion = await apiLocal.crearSesion(asin);

      if (!operacionActiva.current) return;

      setSesionId(sesion.id);
      setEstado('exito');

    } catch (err: any) {
      if (operacionActiva.current) {
        // Exponemos el mensaje de error sanitizado y descriptivo hacia la interfaz
        setError(err.message || 'No fue posible procesar el enlace proporcionado.');
        setEstado('formulario');
      }
    }
  };

  const resetear = () => {
    operacionActiva.current = false;
    setEstado('formulario');
    setError('');
    setMensajeEstado('');
    setSesionId(null);
  };

  return {
    estado,
    error,
    mensajeEstado, // 🚀 Exponemos el mensaje para que tus componentes (ej. VistaCarga.tsx) lo muestren
    sesionId,
    procesarEnlace,
    resetear
  };
};