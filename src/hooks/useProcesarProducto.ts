import { useState, useRef } from 'react';
import { apiLocal } from '../servicios/apiLocal';

export type EstadoModal = 'formulario' | 'procesando' | 'exito';

export const useProcesarProducto = () => {
  const [estado, setEstado] = useState<EstadoModal>('formulario');
  const [error, setError] = useState<string>('');
  const [sesionId, setSesionId] = useState<string | null>(null);
  
  const operacionActiva = useRef(true);

  const procesarEnlace = async (url: string) => {
    if (!url.trim()) {
      setError('Por favor, ingresa el enlace requerido para continuar.');
      return;
    }

    setEstado('procesando');
    setError('');
    operacionActiva.current = true;

    try {
      const respuestaInicial = await apiLocal.cargarNuevoProducto(url);
      const asin = respuestaInicial.asin;

      if (respuestaInicial.status === "procesando") {
        let estadoActual = "procesando";
        while (estadoActual === "procesando") {
          if (!operacionActiva.current) return;
          await new Promise(resolve => setTimeout(resolve, 3000));
          if (!operacionActiva.current) return; 

          const respuestaEstado = await apiLocal.consultarEstadoScraping(asin);
          estadoActual = respuestaEstado.estado;

          if (estadoActual === "error") {
            throw new Error("Ocurrió un error durante la extracción de datos.");
          }
        }
      }

      if (!operacionActiva.current) return;
      const sesion = await apiLocal.crearSesion(asin);
      
      setSesionId(sesion.id);
      setEstado('exito');

    } catch (err: any) {
      if (operacionActiva.current) {
        setError(err.message || 'No pudimos procesar el enlace obligatorio.');
        setEstado('formulario');
      }
    }
  };

  const resetear = () => {
    operacionActiva.current = false;
    setEstado('formulario');
    setError('');
    setSesionId(null);
  };

  return { estado, error, sesionId, procesarEnlace, resetear };
};