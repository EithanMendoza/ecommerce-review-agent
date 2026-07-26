// src/hooks/usarAgenteRAG.ts
import { useState, useRef, useEffect } from 'react';
import { apiLocal } from '../servicios/apiLocal';
import type { Mensaje } from '../tipos/contratos';

export const usarAgenteRAG = (sesionId?: string) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [estadoAgente, setEstadoAgente] = useState<string | null>(null);

  // Referencia para cancelar la petición web
  const abortController = useRef<AbortController | null>(null);

  // 🚀 LIMPIEZA AUTOMÁTICA AL CAMBIAR DE CHAT
  // Si cambias de sesión o vas a chat nuevo, vaciamos los mensajes anteriores
  useEffect(() => {
    if (!sesionId || sesionId === 'undefined') {
      setMensajes([]);
    }
  }, [sesionId]);

  const enviarPregunta = async (texto: string, callbackFinalizado?: (id: string) => void) => {
    if (!texto.trim() || !sesionId || sesionId === 'undefined') {
      console.warn("No se pudo enviar la pregunta: sesionId no es válido o está ausente.");
      return;
    }

    // 1. Agregamos el mensaje del usuario a la pantalla
    const mensajeUsuario: Mensaje = { id: Date.now().toString(), rol: 'usuario', contenido: texto };
    setMensajes((prev) => [...prev, mensajeUsuario]);

    setCargando(true);
    setEstadoAgente('Buscando contexto en base vectorial');

    abortController.current = new AbortController();

    try {
      // Usamos el servicio apiLocal que maneja el token internamente
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
        let esPrimerChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const pedazoTexto = decoder.decode(value, { stream: true });
          textoCompleto += pedazoTexto;

          // Si es el primer pedazo de texto, ocultamos el cuadro de estado
          if (esPrimerChunk) {
            setEstadoAgente(null);
            esPrimerChunk = false;
          }

          // Actualizamos solo el último mensaje en tiempo real
          setMensajes((prev) => {
            const nuevos = [...prev];
            if (nuevos.length > 0) {
              nuevos[nuevos.length - 1].contenido = textoCompleto;
            }
            return nuevos;
          });
        }
      }

      // Ejecutamos el callback si fue proporcionado de manera segura
      if (callbackFinalizado) {
        callbackFinalizado(sesionId);
      }

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