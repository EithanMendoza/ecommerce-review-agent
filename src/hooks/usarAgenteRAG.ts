// src/hooks/usarAgenteRAG.ts
import { useState, useRef } from 'react';
import { apiLocal } from '../servicios/apiLocal';
import type { Mensaje } from '../tipos/contratos';

export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [estadoAgente, setEstadoAgente] = useState<string | null>(null);
  
  // Referencia para cancelar la petición web
  const abortController = useRef<AbortController | null>(null);

  const enviarPregunta = async (texto: string, callbackFinalizado: (id: string) => void) => {
    if (!texto.trim() || !sesionId) return;

    // 1. Agregamos el mensaje del usuario a la pantalla
    const mensajeUsuario: Mensaje = { id: Date.now().toString(), rol: 'usuario', contenido: texto };
    setMensajes((prev) => [...prev, mensajeUsuario]);
    
    setCargando(true);
    setEstadoAgente('Buscando contexto en base vectorial');

    abortController.current = new AbortController();

    try {
      // Usamos el servicio apiLocal que ya maneja el token internamente
      const respuesta = await apiLocal.consultarChat(
        texto, 
        sesionId, 
        abortController.current.signal
      );

      setEstadoAgente('Generando respuesta');
      
      // 2. Preparamos el mensaje vacío del agente RAG
      const idAgente = (Date.now() + 1).toString();
      setMensajes((prev) => [...prev, { id: idAgente, rol: 'agente', contenido: '' }]);

      // 3. Leemos el Stream de tokens
      const reader = respuesta.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let textoCompleto = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const pedazoTexto = decoder.decode(value, { stream: true });
          textoCompleto += pedazoTexto;

          // Actualizamos solo el último mensaje en tiempo real
          setMensajes((prev) => {
            const nuevos = [...prev];
            nuevos[nuevos.length - 1].contenido = textoCompleto;
            return nuevos;
          });
        }
      }

      callbackFinalizado(sesionId);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error("Error en RAG:", error);
        setMensajes((prev) => [
          ...prev, 
          { id: Date.now().toString(), rol: 'agente', contenido: 'Ocurrió un error al procesar tu consulta.' }
        ]);
      }
    } finally {
      setCargando(false);
      setEstadoAgente(null);
    }
  };

  const detenerGeneracion = () => {
    if (abortController.current) {
      abortController.current.abort();
      setCargando(false);
      setEstadoAgente(null);
    }
  };

  return { 
    mensajes, 
    setMensajes, 
    cargando, 
    estadoAgente, 
    enviarPregunta, 
    detenerGeneracion 
  };
};