import { useState } from 'react';
import type { Mensaje } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

const generarShortUUID = () => Math.random().toString(36).substring(2, 10);

export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [estadoAgente, setEstadoAgente] = useState<string | null>(null);

  // Renombramos el callback para dejar claro que se ejecuta al terminar el flujo
  const enviarPregunta = async (texto: string, alFinalizarSesion?: (idFinal: string) => void) => {
    const idUsuario = Date.now().toString();
    const mensajeUsuario: Mensaje = { id: idUsuario, rol: 'usuario', contenido: texto };

    const idAgente = (Date.now() + 1).toString();
    const mensajeAgenteVacio: Mensaje = { id: idAgente, rol: 'agente', contenido: '' };

    setMensajes((previos) => [...previos, mensajeUsuario, mensajeAgenteVacio]);
    setCargando(true);
    setEstadoAgente('Evaluando intención...');

    // Mantenemos fijo el ID durante toda la petición de este scope
    const idSesionDestino = sesionId || generarShortUUID();

    await apiLocal.enviarMensajeStreaming(
      texto,
      idSesionDestino,
      (nuevoChunk) => {
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
          setMensajes((previos) =>
            previos.map((msg) =>
              msg.id === idAgente
                ? { ...msg, contenido: msg.contenido + textoProcesado }
                : msg
            )
          );
        }
      },
      () => {
        setCargando(false);
        setEstadoAgente(null);

        // 🚀 Cuando el stream termina de forma exitosa, actualizamos la URL en la UI de React
        if (alFinalizarSesion) {
          alFinalizarSesion(idSesionDestino);
        }
      }
    );
  };

  return { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta };
};