import type { ResenaRecuperada, SesionChat, MensajeHistorial, ProductoAnalizado, RespuestaHistorialChat, RespuestaEstadoScraping, RespuestaCargarProducto } from '../tipos/contratos';
import { apiAuth } from '../servicios/apiAuth';

const URL_BASE = import.meta.env.VITE_API_URL || '';
// const URL_BASE = 'http://localhost:8000';

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
          'Authorization': `Bearer ${token}`, // Inyectamos el JWT
          'ngrok-skip-browser-warning': 'true'
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
   * 2. Llamada en Streaming para RAG (Devuelve el Response completo)
   * Delega la lectura de los bytes (chunks) al hook usarAgenteRAG para un mejor control de estado.
   */
  consultarChat: async (
    mensaje: string,
    idSesion: string,
    signal?: AbortSignal
  ): Promise<Response> => {
    const token = apiAuth.obtenerToken();

    // Importante: Asegúrate de que la ruta coincida con el @router.post("/consultar") de tu chat.py
    const respuesta = await fetch(`${URL_BASE}/api/consultar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }

      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error en la comunicación con el agente RAG');
    }

    // Retornamos el objeto Response sin procesar
    return respuesta;
  },

  /**
   * Crea una nueva sesión de chat explícita atada a un producto ya analizado.
   * Conecta con el POST /api/sesiones de historial.py (usa crear_sesion() de sesiones.py).
   */
  crearSesion: async (asin: string, titulo?: string): Promise<{ id: string; asin: string; titulo: string }> => {
    const token = apiAuth.obtenerToken();

    const respuesta = await fetch(`${URL_BASE}/api/sesiones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ asin, titulo })
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
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
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/productos`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudieron cargar los productos analizados.');
    }

    const datos = await respuesta.json();
    return datos.productos;
  },

  listarSesiones: async (): Promise<SesionChat[]> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/sesiones`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudieron cargar las sesiones');
    }

    const datos = await respuesta.json();
    return datos.sesiones;
  },

  obtenerHistorialChat: async (sesionId: string): Promise<RespuestaHistorialChat> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/sesiones/${sesionId}/mensajes`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo cargar el historial del chat');
    }

    // 🆕 Devolvemos el objeto completo (antes solo se devolvía `datos.mensajes`,
    // y se perdía el `asin` que el backend ya manda en historial.py)
    return await respuesta.json();
  },

  eliminarSesion: async (sesionId: string): Promise<void> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/sesiones/${sesionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      throw new Error('No se pudo eliminar la sesión');
    }
  },

  consultarEstadoScraping: async (asin: string): Promise<RespuestaEstadoScraping> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/scraper/estado/${asin}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      // Le agregamos la validación del 401 para mantener la seguridad
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      throw new Error('Error al consultar el estado del scraping.');
    }

    return await respuesta.json();
  },

  cargarNuevoProducto: async (url: string): Promise<RespuestaCargarProducto> => {
    const token = apiAuth.obtenerToken();
    const respuesta = await fetch(`${URL_BASE}/api/scraper/iniciar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      },
      // Ajustado a lo que espera SolicitudScraping
      body: JSON.stringify({
        url_o_asin: url,
        marketplace: "com.mx"
      })
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      const dataError = await respuesta.json().catch(() => null);
      throw new Error(dataError?.detail || 'Ocurrió un error al cargar el producto. Verifica la URL.');
    }

    return await respuesta.json();
  },

  // 🔴 CORRECCIÓN CRÍTICA: Se añadió el ASIN como parámetro y se apuntó al nuevo endpoint
  descargarReporteExcel: async (asin: string): Promise<void> => {
    const token = apiAuth.obtenerToken();

    // Apuntamos al endpoint protegido que definiste en metricas.py
    const respuesta = await fetch(`${URL_BASE}/api/metricas/exportar-excel/${asin}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        apiAuth.cerrarSesion();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      // Capturamos el error sanitizado que ahora envía el backend (Status 400)
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