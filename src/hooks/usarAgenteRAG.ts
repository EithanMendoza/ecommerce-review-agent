import { useState, useRef } from 'react';
import type { Mensaje } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

const generarShortUUID = () => Math.random().toString(36).substring(2, 10);

export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [estadoAgente, setEstadoAgente] = useState<string | null>(null);
  
  // NUEVO: Referencia para el controlador de aborto
  const abortControllerRef = useRef<AbortController | null>(null);

  // NUEVO: Función para detener el flujo
  const detenerGeneracion = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort(); // Detiene la petición de red
      abortControllerRef.current = null;
      setCargando(false);
      setEstadoAgente(null);
    }
  };

  const enviarPregunta = async (texto: string, alFinalizarSesion?: (idFinal: string) => void) => {
    const idUsuario = Date.now().toString();
    const mensajeUsuario: Mensaje = { id: idUsuario, rol: 'usuario', contenido: texto };
    const idAgente = (Date.now() + 1).toString();
    const mensajeAgenteVacio: Mensaje = { id: idAgente, rol: 'agente', contenido: '' };

    setMensajes((previos) => [...previos, mensajeUsuario, mensajeAgenteVacio]);
    setCargando(true);
    setEstadoAgente('Evaluando intención...');

    const idSesionDestino = sesionId || generarShortUUID();
    
    // Inicializamos un nuevo AbortController para esta petición
    abortControllerRef.current = new AbortController();

    try {
      await apiLocal.enviarMensajeStreaming(
        texto,
        idSesionDestino,
        (nuevoChunk) => {
          // ... Tu lógica actual de chunks ...
          let textoProcesado = nuevoChunk;
          if (textoProcesado.includes('[[SYS_TOOL:')) {
            const match = textoProcesado.match(/\[\[SYS_TOOL:(.*?)\]\]/);
            if (match) {
              const nombreHerramienta = match[1].replace(/_/g, ' ');
              setEstadoAgente(`Ejecutando herramienta: ${nombreHerramienta}...`);
              textoProcesado = textoProcesado.replace(match[0], '');
            }
          }
          if (textoProcesado.includes('[[SYS_STREAM_START]]')) {
            setEstadoAgente(null);
            textoProcesado = textoProcesado.replace('[[SYS_STREAM_START]]', '');
          }
          if (textoProcesado) {
            setMensajes((previos) => previos.map((msg) =>
                msg.id === idAgente ? { ...msg, contenido: msg.contenido + textoProcesado } : msg
            ));
          }
        },
        () => {
          setCargando(false);
          setEstadoAgente(null);
          if (alFinalizarSesion) alFinalizarSesion(idSesionDestino);
        },
        abortControllerRef.current.signal // NUEVO: Pasamos la señal a tu API
      );
    } catch (error: any) {
      // Manejamos el error si fue causado por nuestra interrupción manual
      if (error.name === 'AbortError' || error.message.includes('aborted')) {
        console.log('Generación detenida por el usuario');
      } else {
        console.error('Error en streaming:', error);
      }
      setCargando(false);
      setEstadoAgente(null);
    }
  };

  return { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta, detenerGeneracion };
};