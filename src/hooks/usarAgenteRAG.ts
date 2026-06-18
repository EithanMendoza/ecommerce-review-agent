import { useState } from 'react';
import type { Mensaje } from '../tipos/contratos';
import { apiLocal } from '../servicios/apiLocal';

// Modificamos la firma para que el hook reciba el sesionId
export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);

  const enviarPregunta = async (texto: string) => {
    const idUsuario = Date.now().toString();
    const mensajeUsuario: Mensaje = { id: idUsuario, rol: 'usuario', contenido: texto };
    
    const idAgente = (Date.now() + 1).toString();
    const mensajeAgenteVacio: Mensaje = { id: idAgente, rol: 'agente', contenido: '' };

    setMensajes((previos) => [...previos, mensajeUsuario, mensajeAgenteVacio]);
    setCargando(true);

    await apiLocal.enviarMensajeStreaming(
      texto,
      sesionId, // Pasamos el ID a la capa de servicios
      (nuevoChunk) => {
        setMensajes((previos) => 
          previos.map((msg) => 
            msg.id === idAgente 
              ? { ...msg, contenido: msg.contenido + nuevoChunk } 
              : msg
          )
        );
      },
      () => {
        setCargando(false);
      }
    );
  };

  return { mensajes, setMensajes, cargando, enviarPregunta };
};