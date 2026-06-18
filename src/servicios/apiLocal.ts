import type { ResenaRecuperada, SesionChat, MensajeHistorial } from '../tipos/contratos';
import { apiAuth } from '../servicios/apiAuth';

// Ajusta el puerto si tu Uvicorn de Python está corriendo en uno distinto
const URL_BASE = 'http://localhost:8000'; 

export const apiLocal = {
  /**
   * 1. Llamada Clásica (Promesa tradicional)
   * Ideal para traer la información tabular desde ChromaDB
   */
  obtenerResenas: async (): Promise<ResenaRecuperada[]> => {
    try {
      const token = apiAuth.obtenerToken(); // Obtenemos el JWT
      
      const respuesta = await fetch(`${URL_BASE}/api/resenas`, {
        headers: {
          'Authorization': `Bearer ${token}` // Inyectamos el JWT
        }
      });
      
      if (!respuesta.ok) {
        // Opcional: Manejo específico si el token de FastAPI expira
        if (respuesta.status === 401) {
          throw new Error('No autorizado: El token es inválido o ha expirado');
        }
        throw new Error(`Error HTTP: ${respuesta.status}`);
      }
      
      return await respuesta.json();
    } catch (error) {
      console.error('Fallo al obtener las reseñas:', error);
      throw error;
    }
  },

  /**
   * 2. Llamada en Streaming (Lectura de Bytes)
   * Conecta con el endpoint de FastAPI que devuelve el streaming del modelo
   */
  enviarMensajeStreaming: async (
    pregunta: string,
    sesionId: string | undefined, // Recibimos el ID de la sesión (puede ser undefined si es un chat nuevo)
    alRecibirChunk: (textoNuevo: string) => void,
    alCompletar: () => void
  ) => {
    try {
      const token = apiAuth.obtenerToken();
      
      // Armamos el payload dinámicamente
      const payload: { mensaje: string; id_sesion?: string } = { mensaje: pregunta };
      if (sesionId) {
        payload.id_sesion = sesionId; 
      }

      const respuesta = await fetch(`${URL_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload), 
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error('No autorizado: Token inválido en el chat');
        }
        throw new Error('Error en la comunicación con el agente RAG');
      }
      
      if (!respuesta.body) throw new Error('El servidor no devolvió un stream de datos');

      // Interceptamos el flujo de datos crudos antes de que termine la petición
      const lector = respuesta.body.getReader();
      const decodificador = new TextDecoder('utf-8');
      let leyendo = true;

      while (leyendo) {
        const { value, done } = await lector.read();
        leyendo = !done;
        
        if (value) {
          // Convertimos los bytes que manda Python a texto legible
          const pedazoTexto = decodificador.decode(value, { stream: true });
          alRecibirChunk(pedazoTexto);
        }
      }

      // Avisamos a la UI que el modelo terminó de generar la respuesta
      alCompletar();
      
    } catch (error) {
      console.error('Error en el stream del chat:', error);
      alRecibirChunk('\n\n[Error: Se perdió la conexión con el motor backend o el token falló]');
      alCompletar();
    }
  },

  listarSesiones: async (): Promise<SesionChat[]> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/sesiones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      throw new Error('No se pudieron cargar las sesiones');
    }

    const datos = await respuesta.json();
    return datos.sesiones; // Devuelve la lista que enviaste desde FastAPI
  },

  obtenerHistorialChat: async (sesionId: string): Promise<MensajeHistorial[]> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/sesiones/${sesionId}/mensajes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!respuesta.ok) {
      throw new Error('No se pudo cargar el historial del chat');
    }

    const datos = await respuesta.json();
    return datos.mensajes; // Devuelve los mensajes de esa sesión específica
  }
};