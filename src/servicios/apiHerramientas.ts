import { apiAuth } from './apiAuth';

const URL_BASE = import.meta.env.VITE_API_URL || '';

// Función auxiliar para no repetir la inyección del token
const fetchHerramienta = async (endpoint: string, opciones: RequestInit = {}) => {
  const token = apiAuth.obtenerToken();
  const respuesta = await fetch(`${URL_BASE}${endpoint}`, {
    ...opciones,
    headers: {
      ...opciones.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      apiAuth.cerrarSesion();
      window.location.href = '/login';
      throw new Error('Sesión expirada.');
    }

    // Intentamos extraer el mensaje detallado de error del JSON que devuelve FastAPI
    try {
      const errorJson = await respuesta.json();
      throw new Error(errorJson.detail || errorJson.error || `Error (${respuesta.status}) en la herramienta`);
    } catch (e: any) {
      if (e.message && !e.message.includes('JSON')) throw e;
      throw new Error(`Error ${respuesta.status} en la herramienta: ${endpoint}`);
    }
  }

  // 🚀 CORRECCIÓN CLAVE: Convertimos a minúsculas y validamos si es PDF o un endpoint de exportación
  const contentType = (respuesta.headers.get('content-type') || '').toLowerCase();
  const esEndpointExportacion = endpoint.includes('exportar');

  if (
    esEndpointExportacion ||
    contentType.includes('application/pdf') ||
    contentType.includes('text/csv') ||
    contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
    contentType.includes('application/vnd.ms-excel') ||
    contentType.includes('application/octet-stream')
  ) {
    return respuesta.blob(); // 🟢 Retorna el archivo binario limpio sin intentar parsear JSON
  }

  // Si no es un archivo descargable, asumimos que es una respuesta JSON estructurada
  return respuesta.json();
};

export const apiHerramientas = {
  // 🚀 Diagnósticos y estados de auditoría
  diagnostico: () => fetchHerramienta('/api/metricas/diagnostico', { method: 'GET' }),
  obtenerUltimoAsin: () => fetchHerramienta('/api/metricas/ultimo-asin', { method: 'GET' }),
  metricasUltima: () => fetchHerramienta('/api/metricas/ultima', { method: 'GET' }),
  reportes: () => fetchHerramienta('/api/metricas/reportes', { method: 'GET' }),

  // 🧹 LIMPIEZA DE PERFIL: Ejecuta el vaciado en SQLite y ChromaDB de forma segura
  limpiarCache: () => fetchHerramienta('/api/metricas/limpiar-cache', { method: 'POST' }),

  // 📊 EXPORTACIÓN A EXCEL Y MÉTRICAS
  exportarExcel: (asin: string) =>
    fetchHerramienta(`/api/metricas/exportar-excel/${asin}`, {
      method: 'POST'
    }),

  // 🔴 EXPORTACIÓN DE RESUMEN EJECUTIVO PDF
  exportarPdf: (asin: string) =>
    fetchHerramienta(`/api/metricas/exportar-pdf/${asin}`, {
      method: 'POST'
    }),

  metricasResumen: (asin: string) => fetchHerramienta(`/api/metricas/resumen/${asin}`, { method: 'GET' }),

  // 🛍️ Información de contexto sobre el Producto actual
  obtenerProductoActual: () => fetchHerramienta('/api/dashboard/producto-actual', { method: 'GET' }),

  // 📦 PRODUCTOS Y SESIONES AUTENTICADAS
  listarProductos: () => fetchHerramienta('/api/productos', { method: 'GET' }),

  // 🟢 Creación explícita de hilos de chat con UUID
  crearSesion: (asin: string) =>
    fetchHerramienta('/api/sesiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ asin })
    }).then(res => ({ id: res.id || res.sesion_id })),

  iniciarScraping: (urlOAsin: string) =>
    fetchHerramienta('/api/scraper/iniciar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url_o_asin: urlOAsin, marketplace: 'com.mx' })
    }),

  /**
   * Elimina de golpe todo el historial de conversaciones de un perfil específico.
   * @param usuarioId El identificador único del usuario en sesión
   */
  purgarHistorialPerfil: (usuarioId: string) =>
    fetchHerramienta(`/api/usuarios/${usuarioId}/historial/purgar`, { method: 'DELETE' }),
};