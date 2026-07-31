// src/hooks/useProcesarProducto.ts
import { useState, useRef } from 'react';
import { apiLocal } from '../servicios/apiLocal';

export type EstadoModal = 'formulario' | 'procesando' | 'exito';

export const useProcesarProducto = () => {
  const [estado, setEstado] = useState<EstadoModal>('formulario');
  const [error, setError] = useState<string>('');
  const [mensajeEstado, setMensajeEstado] = useState<string>('');
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
      // 1. Solicitamos el inicio del Scraping
      const respuestaInicial = await apiLocal.cargarNuevoProducto(url);
      const asin = respuestaInicial.asin;

      // VÍA RÁPIDA: Si el producto ya existía en la BD
      if (respuestaInicial.status === "listo") {
        setMensajeEstado(respuestaInicial.mensaje || 'Producto recuperado con éxito.');
      }
      // VÍA LENTA: El scraper entró en la cola de procesamiento
      else if (respuestaInicial.status === "procesando") {
        setMensajeEstado(respuestaInicial.mensaje || 'Procesando producto...');

        // 2. Escucha del Stream SSE convertida en Promesa
        await new Promise<void>((resolve, reject) => {
          apiLocal.escucharEstadoScraping(asin, (respuestaEstado) => {
            // Si el usuario cerró el modal o desmontó el componente, ignoramos
            if (!operacionActiva.current) {
              resolve(); 
              return;
            }

            // Actualizamos la UI en tiempo real
            setMensajeEstado(respuestaEstado.mensaje || 'Analizando comentarios...');

            // Evaluamos los estados finales para romper la Promesa
            if (respuestaEstado.estado === "completado") {
              resolve(); // ¡Éxito! Avanza a la línea 66
            } 
            else if (respuestaEstado.estado === "error_sin_resenas") {
              reject(new Error(respuestaEstado.mensaje || "El producto no cuenta con opiniones públicas suficientes en Amazon."));
            } 
            else if (respuestaEstado.estado === "error" || respuestaEstado.estado === "no_encontrado") {
              reject(new Error(respuestaEstado.mensaje || "No se pudo completar la extracción del producto. Intenta más tarde."));
            }
          }).catch(reject); // Captura errores de red del fetch
        });
      }

      if (!operacionActiva.current) return;

      // 3. Cuando el stream termina con éxito, creamos la conversación enlazada
      setMensajeEstado('Indexación completada. Inicializando sesión de chat...');
      const sesion = await apiLocal.crearSesion(asin);

      if (!operacionActiva.current) return;

      setSesionId(sesion.id);
      setEstado('exito');

    } catch (err: any) {
      if (operacionActiva.current) {
        // Exponemos el error a la interfaz (capturado del reject de la Promesa o de errores HTTP)
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
    mensajeEstado,
    sesionId,
    procesarEnlace,
    resetear
  };
};