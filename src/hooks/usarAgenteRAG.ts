import { useState } from 'react';
import type { Mensaje } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  
  // NUEVO: Estado para rastrear lo que hace el agente en background
  const [estadoAgente, setEstadoAgente] = useState<string | null>(null);

  const enviarPregunta = async (texto: string) => {
    const idUsuario = Date.now().toString();
    const mensajeUsuario: Mensaje = { id: idUsuario, rol: 'usuario', contenido: texto };
    
    const idAgente = (Date.now() + 1).toString();
    const mensajeAgenteVacio: Mensaje = { id: idAgente, rol: 'agente', contenido: '' };

    setMensajes((previos) => [...previos, mensajeUsuario, mensajeAgenteVacio]);
    setCargando(true);
    
    // Estado inicial antes de que llegue el primer chunk
    setEstadoAgente('Evaluando intención...'); 

    await apiLocal.enviarMensajeStreaming(
      texto,
      sesionId, 
      (nuevoChunk) => {
        let textoProcesado = nuevoChunk;

        // 1. Interceptar banderas de herramientas (Ej: [[SYS_TOOL:busqueda_chroma]])
        if (textoProcesado.includes('[[SYS_TOOL:')) {
          const match = textoProcesado.match(/\[\[SYS_TOOL:(.*?)\]\]/);
          if (match) {
            // Reemplazamos guiones bajos por espacios para que se vea bonito en la UI
            const nombreHerramienta = match[1].replace(/_/g, ' ');
            setEstadoAgente(`Ejecutando herramienta: ${nombreHerramienta}...`);
            
            // Borramos la bandera del texto para que no se imprima en el chat
            textoProcesado = textoProcesado.replace(match[0], ''); 
          }
        }

        // 2. Interceptar bandera de inicio de stream real
        if (textoProcesado.includes('[[SYS_STREAM_START]]')) {
          // El agente ya empezó a hablar, ocultamos el mensaje de estado
          setEstadoAgente(null); 
          textoProcesado = textoProcesado.replace('[[SYS_STREAM_START]]', ''); 
        }

        // 3. Concatenar el resto del texto limpio a la burbuja
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
        setEstadoAgente(null); // Limpiamos por seguridad al terminar
      }
    );
  };

  // Exportamos el nuevo estado
  return { mensajes, setMensajes, cargando, estadoAgente, enviarPregunta };
};