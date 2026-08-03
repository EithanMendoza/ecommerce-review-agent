import type { ResenaRecuperada, SesionChat, MensajeHistorial, ProductoAnalizado, RespuestaHistorialChat, RespuestaEstadoScraping, RespuestaCargarProducto } from '../tipos/contratos';
import { apiAuth } from '../servicios/apiAuth';

const URL_BASE = import.meta.env.VITE_API_URL || '';


export const apiLocal = {
  /**
   * 1. Llamada Clásica (Promesa tradicional)
   * Ideal para traer la información tabular desde ChromaDB
   */
  obtenerResenas: async (): Promise<ResenaRecuperada[]> => {
    try {
      const respuesta = await fetch(`${URL_BASE}/api/resenas`, {
        credentials: 'include', // 🍪 manda la cookie HttpOnly en vez del header Authorization
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (!respuesta.ok) {
        if (respuesta.status === 401) {
          throw new Error('No autorizado: la sesión es inválida o ha expirado');
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
   * 2. Llamada en Streaming para RAG (Devuelve el Response completo)
   * Delega la lectura de los bytes (chunks) al hook usarAgenteRAG para un mejor control de estado.
   */
  consultarChat: async (
    mensaje: string,
    idSesion: string,
    signal?: AbortSignal
  ): Promise<Response> => {
    const respuesta = await fetch(`${URL_BASE}/api/consultar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        mensaje: mensaje,
        id_sesion: idSesion
      }),
      signal: signal
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error en la comunicación con el agente RAG');
    }

    return respuesta;
  },

  /**
   * Crea una nueva sesión de chat explícita atada a un producto ya analizado.
   * Conecta con el POST /api/sesiones de historial.py (usa crear_sesion() de sesiones.py).
   */
  crearSesion: async (asin: string, titulo?: string): Promise<{ id: string; asin: string; titulo: string }> => {
    const respuesta = await fetch(`${URL_BASE}/api/sesiones`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ asin, titulo })
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.detail || 'No se pudo crear la sesión de chat.');
    }

    return await respuesta.json();
  },

  /**
   * Lista todos los productos ya analizados (independiente de si tienen o no un chat activo).
   * Se usa en "Chat nuevo" para dejar elegir sobre cuál producto seguir preguntando.
   */
  listarProductos: async (): Promise<ProductoAnalizado[]> => {
    const respuesta = await fetch(`${URL_BASE}/api/productos`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudieron cargar los productos analizados.');
    }

    const datos = await respuesta.json();
    return datos.productos;
  },

  listarSesiones: async (): Promise<SesionChat[]> => {
    const respuesta = await fetch(`${URL_BASE}/api/sesiones`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudieron cargar las sesiones');
    }

    const datos = await respuesta.json();
    return datos.sesiones;
  },

  obtenerHistorialChat: async (sesionId: string): Promise<RespuestaHistorialChat> => {
    const respuesta = await fetch(`${URL_BASE}/api/sesiones/${sesionId}/mensajes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo cargar el historial del chat');
    }

    return await respuesta.json();
  },

  eliminarSesion: async (sesionId: string): Promise<void> => {
    const respuesta = await fetch(`${URL_BASE}/api/sesiones/${sesionId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo eliminar la sesión');
    }
  },

  escucharEstadoScraping: async (
    asin: string,
    onUpdate: (estado: RespuestaEstadoScraping) => void
  ): Promise<void> => {
    const respuesta = await fetch(`${URL_BASE}/api/scraper/estado/stream/${asin}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'text/event-stream'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      throw new Error('Error al conectar con el stream de scraping.');
    }

    const reader = respuesta.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    if (!reader) throw new Error('El navegador no soporta streaming.');

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const mensajes = buffer.split('\n\n');
        buffer = mensajes.pop() || "";

        for (const mensaje of mensajes) {
          if (mensaje.startsWith('data: ')) {
            const jsonStr = mensaje.substring(6).trim();

            if (jsonStr) {
              const datos = JSON.parse(jsonStr) as RespuestaEstadoScraping;

              onUpdate(datos);

              const estadosFinales = ['completado', 'error', 'error_sin_resenas', 'no_encontrado'];
              if (estadosFinales.includes(datos.estado)) {
                reader.cancel();
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error leyendo el stream de estado:", error);
      throw error;
    }
  },

  cargarNuevoProducto: async (url: string): Promise<RespuestaCargarProducto> => {
    const respuesta = await fetch(`${URL_BASE}/api/scraper/iniciar`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        url_o_asin: url,
        marketplace: "com.mx"
      })
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      const dataError = await respuesta.json().catch(() => null);
      throw new Error(dataError?.detail || 'Ocurrió un error al cargar el producto. Verifica la URL.');
    }

    return await respuesta.json();
  },

  descargarReporteExcel: async (asin: string): Promise<void> => {
    const respuesta = await fetch(`${URL_BASE}/api/metricas/exportar-excel/${asin}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        await apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      const dataError = await respuesta.json().catch(() => null);
      throw new Error(dataError?.detail || 'Hubo un error al generar o descargar el reporte Excel.');
    }

    const blob = await respuesta.blob();
    const urlArchivo = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = urlArchivo;

    const nombreArchivo = `Reporte_${asin.toUpperCase()}_${new Date().getTime()}.xlsx`;
    enlace.setAttribute('download', nombreArchivo);

    document.body.appendChild(enlace);
    enlace.click();

    enlace.parentNode?.removeChild(enlace);
    window.URL.revokeObjectURL(urlArchivo);
  }
};